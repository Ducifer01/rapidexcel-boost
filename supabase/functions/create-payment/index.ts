import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  console.log(`[CREATE-PAYMENT] ${step}`, details ? JSON.stringify(details) : '');
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep('Iniciando criação de pagamento');
    
    const { product_ids, payer, back_urls, password, authenticated_user_id } = await req.json();
    logStep('Dados recebidos', { product_ids, payer_email: payer?.email, authenticated: !!authenticated_user_id });

    // VALIDAÇÃO DE SEGURANÇA: Preços definidos NO SERVIDOR
    const VALID_PRODUCTS = {
      'pack_1': { 
        title: 'Planilhas 6k Pro - 6.000 Planilhas Excel', 
        price: 12.99,
        description: 'Acesso a 6.000 planilhas editáveis em todas as categorias'
      },
      'pack_2': { 
        title: 'Dashboards+Bônus - Planner + 50 Dashboards', 
        price: 12.99,
        description: 'Planner de Organização Financeira + 50 Dashboards Premium'
      },
    };

    // Validar IDs dos produtos
    if (!product_ids || !Array.isArray(product_ids) || product_ids.length === 0) {
      throw new Error('product_ids inválido ou vazio');
    }

    // Validar que Pack 2 nunca vem sozinho
    if (product_ids.length === 1 && product_ids[0] === 'pack_2') {
      throw new Error('Pack 2 só pode ser comprado junto com Pack 1');
    }

    // Validar payer
    if (!payer?.email || !payer?.name) {
      throw new Error('Dados do comprador incompletos');
    }

    // Validar senha
    if (!password || password.length < 6) {
      throw new Error('Senha inválida');
    }

    // Construir items com preços SEGUROS do servidor
    const items = product_ids.map((id: string) => {
      const product = VALID_PRODUCTS[id as keyof typeof VALID_PRODUCTS];
      if (!product) {
        throw new Error(`Produto inválido: ${id}`);
      }
      return {
        title: product.title,
        description: product.description,
        quantity: 1,
        unit_price: product.price,
        currency_id: 'BRL',
      };
    });

    logStep('Items validados', { items });

    const mercadoPagoAccessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    
    if (!mercadoPagoAccessToken) {
      logStep('ERRO: Token não configurado');
      throw new Error('MercadoPago Access Token não configurado');
    }

    // Criar cliente Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. VERIFICAR/CRIAR USUÁRIO
    let authUserId: string | null = null;
    let newUser: any = null;
    
    if (authenticated_user_id) {
      // Usuário já autenticado comprando do Dashboard
      logStep('Compra de usuário autenticado', { userId: authenticated_user_id });
      authUserId = authenticated_user_id;
    } else {
      // Fluxo de checkout público (novos usuários)
      logStep('Verificando/Criando usuário', { email: payer.email });
      
      // Tentar criar o usuário diretamente
      const { data: userData, error: authError } = await supabase.auth.admin.createUser({
        email: payer.email,
        password: password,
        email_confirm: true,
        user_metadata: {
          name: payer.name,
        }
      });

      if (authError) {
        // Se erro é "email_exists", usuário não deveria chegar aqui (frontend bloqueia)
        if (authError.code === 'email_exists') {
          logStep('ERRO: Email já cadastrado tentou fazer checkout', { email: payer.email });
          throw new Error('Email já cadastrado. Faça login para comprar novos produtos.');
        } else {
          // Outro erro ao criar usuário
          logStep('ERRO ao criar usuário', authError);
          throw new Error(`Erro ao criar usuário: ${authError?.message}`);
        }
      } else if (userData?.user) {
        // Usuário criado com sucesso
        newUser = userData;
        authUserId = userData.user.id;
        logStep('Usuário criado com sucesso', { userId: authUserId });
      }

      if (!authUserId) {
        throw new Error('Não foi possível obter ID do usuário');
      }
    }

    // 2. REGISTRAR COMPRA com auth_user_id
    const totalAmount = items.reduce((sum: number, item: any) => sum + (item.unit_price * item.quantity), 0);
    logStep('Registrando compra no Supabase', { email: payer.email, userId: authUserId, total: totalAmount });

    const { data: purchase, error: insertError } = await supabase
      .from('purchases')
      .insert({
        user_email: payer.email,
        products: items.map((item: any) => item.title),
        total_amount: totalAmount,
        payment_status: 'pending',
        payment_id: 'temp', // Temporário (será atualizado pelo webhook)
        auth_user_id: authUserId, // Usuário já criado
      })
      .select()
      .single();

    if (insertError || !purchase) {
      logStep('ERRO ao inserir compra', insertError);
      throw new Error(`Erro ao registrar compra: ${insertError?.message}`);
    }

    logStep('Compra registrada com sucesso', { purchaseId: purchase.id });

    // 3. GERAR TOKENS DE AUTENTICAÇÃO (criar sessão) - apenas para novos usuários
    let authTokens = null;
    if (newUser) {
      // Para novo usuário, criar sessão
      logStep('Gerando tokens de autenticação', { userId: authUserId });
      
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: payer.email,
        password: password,
      });

      if (!signInError && signInData.session) {
        authTokens = {
          access_token: signInData.session.access_token,
          refresh_token: signInData.session.refresh_token,
        };
        logStep('Tokens gerados com sucesso');
      } else {
        logStep('ERRO ao gerar tokens', signInError);
      }
    }

    // 4. CRIAR PREFERÊNCIA NO MERCADOPAGO usando o UUID da compra
    const preferenceData = {
      items,
      payer: {
        name: payer.name,
        email: payer.email,
        identification: payer.identification || undefined,
      },
      back_urls: back_urls || {
        success: `${req.headers.get('origin')}/success`,
        failure: `${req.headers.get('origin')}/failure`,
        pending: `${req.headers.get('origin')}/pending`,
      },
      notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/payment-webhook`,
      external_reference: purchase.id, // UUID da compra
      auto_return: 'approved',
      statement_descriptor: 'PLANILHAEXPRESS',
      payment_methods: {
        excluded_payment_types: [],
        installments: 12,
        default_installments: 1,
      },
    };

    logStep('Enviando para MercadoPago', { url: 'https://api.mercadopago.com/checkout/preferences', purchaseId: purchase.id });

    const mercadoPagoResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mercadoPagoAccessToken}`,
      },
      body: JSON.stringify(preferenceData),
    });

    if (!mercadoPagoResponse.ok) {
      const errorText = await mercadoPagoResponse.text();
      logStep('ERRO do MercadoPago', { status: mercadoPagoResponse.status, error: errorText });
      throw new Error(`Erro do MercadoPago: ${errorText}`);
    }

    const preference = await mercadoPagoResponse.json();
    logStep('Preferência criada', { preference_id: preference.id });

    return new Response(
      JSON.stringify({
        preference_id: preference.id,
        init_point: preference.init_point,
        external_reference: purchase.id, // Retornar UUID da compra
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
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
