import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  console.log(`[PROCESS-PAYMENT] ${step}`, details ? JSON.stringify(details) : '');
};

// PRODUTOS VÁLIDOS - Source of truth
const VALID_PRODUCTS = {
  'pack_1': { 
    title: 'Pack Excel Completo Pro - 13.000 Planilhas', 
    price: 12.99,
  },
  'pack_2': { 
    title: 'Pack Office Premium - Templates Word + Slides PowerPoint', 
    price: 29.99,
  },
};

serve(async (req) => {
  console.log('📥 ============ PROCESS-PAYMENT CHAMADA ============');
  console.log('📥 Method:', req.method);
  console.log('📥 Headers:', Object.fromEntries(req.headers.entries()));
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep('Iniciando processamento de pagamento via Payment Brick');
    
    const body = await req.json();
    console.log('📦 Body raw recebido:', JSON.stringify(body, null, 2));
    
    const { formData, userData, selectedProducts } = body;
    logStep('Dados recebidos', { 
      hasFormData: !!formData, 
      userData: userData?.email,
      products: selectedProducts 
    });

    // Validar produtos selecionados
    if (!selectedProducts || !Array.isArray(selectedProducts) || selectedProducts.length === 0) {
      throw new Error('Produtos inválidos ou vazios');
    }

    // Validar que Pack 2 não vem sozinho em checkout público
    if (selectedProducts.length === 1 && selectedProducts[0] === 'pack_2') {
      throw new Error('Pack 2 só pode ser comprado junto com Pack 1');
    }

    // Validar dados do usuário
    if (!userData?.email || !userData?.name || !userData?.password) {
      throw new Error('Dados do usuário incompletos');
    }

    if (userData.password.length < 6) {
      throw new Error('Senha deve ter no mínimo 6 caracteres');
    }

    // Calcular valor total com base nos produtos selecionados
    const totalAmount = selectedProducts.reduce((sum: number, productId: string) => {
      const product = VALID_PRODUCTS[productId as keyof typeof VALID_PRODUCTS];
      if (!product) {
        throw new Error(`Produto inválido: ${productId}`);
      }
      return sum + product.price;
    }, 0);

    logStep('Valor total calculado', { totalAmount, products: selectedProducts });

    // Verificar se o valor do formData bate com o calculado
    if (formData.transaction_amount && Math.abs(formData.transaction_amount - totalAmount) > 0.01) {
      logStep('ALERTA: Valor divergente', { 
        received: formData.transaction_amount, 
        expected: totalAmount 
      });
      throw new Error('Valor do pagamento não corresponde aos produtos selecionados');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verificar se email já existe
    const { data: existingUsers, error: checkError } = await supabase.auth.admin.listUsers();
    
    if (checkError) {
      logStep('ERRO ao verificar usuários existentes', checkError);
    }

    const emailExists = existingUsers?.users.some(u => u.email === userData.email);
    
    if (emailExists) {
      throw new Error('Email já cadastrado. Faça login para comprar novos produtos.');
    }

    // Criar usuário
    logStep('Criando usuário', { email: userData.email });
    
    const { data: newUser, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: {
        name: userData.name,
      }
    });

    if (authError || !newUser.user) {
      logStep('ERRO ao criar usuário', authError);
      throw new Error(`Erro ao criar usuário: ${authError?.message}`);
    }

    const authUserId = newUser.user.id;
    logStep('Usuário criado com sucesso', { userId: authUserId });

    // Processar pagamento no Mercado Pago
    const mercadoPagoAccessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    
    if (!mercadoPagoAccessToken) {
      throw new Error('Token do Mercado Pago não configurado');
    }

    // Preparar body do pagamento
    const paymentBody = {
      ...formData,
      transaction_amount: totalAmount,
      description: selectedProducts.map(id => VALID_PRODUCTS[id as keyof typeof VALID_PRODUCTS].title).join(' + '),
      payer: {
        ...formData.payer,
        email: userData.email,
        // Mapear identification.type para entity_type do Mercado Pago
        entity_type: formData.payer?.identification?.type === 'CNPJ' ? 'association' : 'individual',
      },
    };

    // Validar método de pagamento (apenas PIX e Cartão de Crédito)
    const allowedMethods = ['pix', 'credit_card'];
    const paymentMethodId = formData.payment_method_id;
    
    if (!allowedMethods.includes(paymentMethodId)) {
      logStep('Método de pagamento não permitido', { method: paymentMethodId });
      throw new Error('Método de pagamento não aceito. Use PIX ou Cartão de Crédito.');
    }

    // Validar parcelamento máximo (2x)
    if (formData.installments && formData.installments > 2) {
      logStep('Parcelamento excede o máximo', { installments: formData.installments });
      throw new Error('Parcelamento máximo: 2x sem juros');
    }

    logStep('Enviando pagamento para Mercado Pago', { 
      amount: totalAmount,
      method: paymentMethodId,
      installments: formData.installments || 1
    });

    const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mercadoPagoAccessToken}`,
        'X-Idempotency-Key': crypto.randomUUID(),
      },
      body: JSON.stringify(paymentBody),
    });

    if (!mpResponse.ok) {
      const errorText = await mpResponse.text();
      logStep('ERRO do MercadoPago', { status: mpResponse.status, error: errorText });
      throw new Error(`Erro ao processar pagamento: ${errorText}`);
    }

    const mpPayment = await mpResponse.json();
    logStep('Pagamento criado no MercadoPago', { 
      id: mpPayment.id, 
      status: mpPayment.status 
    });

    // Registrar compra no Supabase
    const productTitles = selectedProducts.map(id => 
      VALID_PRODUCTS[id as keyof typeof VALID_PRODUCTS].title
    );

    const { data: purchase, error: insertError } = await supabase
      .from('purchases')
      .insert({
        user_email: userData.email,
        products: productTitles,
        total_amount: totalAmount,
        payment_status: mpPayment.status,
        payment_id: mpPayment.id.toString(),
        auth_user_id: authUserId,
      })
      .select()
      .single();

    if (insertError || !purchase) {
      logStep('ERRO ao registrar compra', insertError);
      throw new Error(`Erro ao registrar compra: ${insertError?.message}`);
    }

    logStep('Compra registrada com sucesso', { purchaseId: purchase.id });

    // Criar sessão de autenticação
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: userData.email,
      password: userData.password,
    });

    let authTokens = null;
    if (!signInError && signInData.session) {
      authTokens = {
        access_token: signInData.session.access_token,
        refresh_token: signInData.session.refresh_token,
      };
      logStep('Tokens de autenticação gerados');
    }

    // Retornar resposta baseada no status do pagamento
    return new Response(
      JSON.stringify({
        success: true,
        payment: {
          id: mpPayment.id,
          status: mpPayment.status,
          status_detail: mpPayment.status_detail,
          payment_method_id: mpPayment.payment_method_id,
          transaction_amount: mpPayment.transaction_amount,
          // Dados do PIX se aplicável
          point_of_interaction: mpPayment.point_of_interaction,
        },
        purchase_id: purchase.id,
        auth_tokens: authTokens,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    logStep('ERRO GERAL', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMessage 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
