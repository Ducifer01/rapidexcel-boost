import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  console.log(`[PROCESS-PAYMENT] ${step}`, details ? JSON.stringify(details) : '');
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep('Iniciando processamento de pagamento direto');
    
    const { product_ids, payer, card_token, password } = await req.json();
    logStep('Dados recebidos', { 
      product_ids, 
      payer_email: payer?.email,
      has_token: !!card_token 
    });

    // VALIDAÇÃO DE SEGURANÇA: Preços definidos NO SERVIDOR
    const VALID_PRODUCTS = {
      'pack_1': { title: 'Planilhas 6k Pro - 6.000 Planilhas Excel', price: 12.99 },
      'pack_2': { title: 'Dashboards+Bônus - Planner + 50 Dashboards', price: 12.99 },
    };

    if (!product_ids || !Array.isArray(product_ids)) {
      throw new Error('product_ids inválido');
    }

    if (product_ids.length === 1 && product_ids[0] === 'pack_2') {
      throw new Error('Pack 2 só pode ser comprado junto com Pack 1');
    }

    if (!card_token) {
      throw new Error('Token do cartão não fornecido');
    }

    if (!payer?.email || !payer?.name) {
      throw new Error('Dados do comprador incompletos');
    }

    if (!payer?.identification?.number) {
      throw new Error('CPF não fornecido');
    }

    // Calcular valor total
    const totalAmount = product_ids.reduce((sum: number, id: string) => {
      const product = VALID_PRODUCTS[id as keyof typeof VALID_PRODUCTS];
      if (!product) throw new Error(`Produto inválido: ${id}`);
      return sum + product.price;
    }, 0);

    logStep('Valor total calculado', { totalAmount });

    const mercadoPagoAccessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    
    if (!mercadoPagoAccessToken) {
      throw new Error('MercadoPago Access Token não configurado');
    }

    const description = product_ids.map((id: string) => 
      VALID_PRODUCTS[id as keyof typeof VALID_PRODUCTS].title
    ).join(' + ');

    // Processar pagamento com Mercado Pago
    const paymentData = {
      transaction_amount: totalAmount,
      token: card_token,
      description: description,
      installments: 1,
      payment_method_id: 'visa', // Será detectado automaticamente pelo token
      payer: {
        email: payer.email,
        first_name: payer.name.split(' ')[0],
        last_name: payer.name.split(' ').slice(1).join(' ') || payer.name.split(' ')[0],
        identification: {
          type: payer.identification.type || 'CPF',
          number: payer.identification.number.replace(/\D/g, ''),
        },
      },
      statement_descriptor: 'PLANILHAEXPRESS',
    };

    logStep('Enviando pagamento para Mercado Pago');

    const mercadoPagoResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mercadoPagoAccessToken}`,
        'X-Idempotency-Key': crypto.randomUUID(),
      },
      body: JSON.stringify(paymentData),
    });

    if (!mercadoPagoResponse.ok) {
      const errorText = await mercadoPagoResponse.text();
      logStep('ERRO do MercadoPago', { status: mercadoPagoResponse.status, error: errorText });
      throw new Error(`Erro ao processar pagamento: ${errorText}`);
    }

    const payment = await mercadoPagoResponse.json();
    logStep('Pagamento processado', { 
      id: payment.id, 
      status: payment.status,
      status_detail: payment.status_detail 
    });

    // Registrar no Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Hash da senha
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const products = product_ids.map((id: string) => 
      VALID_PRODUCTS[id as keyof typeof VALID_PRODUCTS].title
    );

    // Se aprovado, criar usuário imediatamente
    let authUserId = null;
    if (payment.status === 'approved') {
      logStep('Pagamento aprovado, criando usuário');
      
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: payer.email,
        password: password,
        email_confirm: true,
        user_metadata: {
          name: payer.name,
          cpf: payer.identification.number,
          email_verified: true,
        },
      });

      if (authError) {
        logStep('ERRO ao criar usuário', authError);
      } else if (authData.user) {
        authUserId = authData.user.id;
        logStep('Usuário criado', { userId: authUserId });
      }
    }

    // Inserir compra
    logStep('Registrando compra no Supabase');
    
    const { error: purchaseError } = await supabase.from('purchases').insert({
      user_email: payer.email,
      products: products,
      total_amount: totalAmount,
      payment_status: payment.status,
      payment_id: payment.id.toString(),
      password_hash: payment.status === 'approved' ? null : passwordHash,
      auth_user_id: authUserId,
    });

    if (purchaseError) {
      logStep('ERRO ao registrar compra', purchaseError);
    }

    logStep('Processamento concluído com sucesso');

    return new Response(
      JSON.stringify({
        payment_id: payment.id,
        status: payment.status,
        status_detail: payment.status_detail,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    logStep('ERRO GERAL no process-payment', error);
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
