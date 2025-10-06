import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { product_ids, payer, card_token, password } = await req.json();

    console.log('Iniciando processamento de pagamento transparente');

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

    // Calcular valor total
    const totalAmount = product_ids.reduce((sum: number, id: string) => {
      const product = VALID_PRODUCTS[id as keyof typeof VALID_PRODUCTS];
      if (!product) throw new Error(`Produto inválido: ${id}`);
      return sum + product.price;
    }, 0);

    const mercadoPagoAccessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    
    if (!mercadoPagoAccessToken) {
      throw new Error('MercadoPago Access Token não configurado');
    }

    // Processar pagamento com Mercado Pago
    const paymentData = {
      transaction_amount: totalAmount,
      token: card_token,
      description: product_ids.map((id: string) => 
        VALID_PRODUCTS[id as keyof typeof VALID_PRODUCTS].title
      ).join(' + '),
      installments: 1,
      payment_method_id: 'visa', // Será detectado automaticamente pelo token
      payer: {
        email: payer.email,
        identification: {
          type: payer.identification.type,
          number: payer.identification.number,
        },
      },
    };

    console.log('Enviando pagamento para Mercado Pago');

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
      const error = await mercadoPagoResponse.text();
      console.error('Erro do MercadoPago:', error);
      throw new Error('Erro ao processar pagamento no MercadoPago');
    }

    const payment = await mercadoPagoResponse.json();
    console.log('Pagamento processado:', payment.id, payment.status);

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
      console.log('Pagamento aprovado, criando usuário');
      
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: payer.email,
        password: password,
        email_confirm: true,
        user_metadata: {
          name: payer.name,
          email_verified: true,
        },
      });

      if (authError) {
        console.error('Erro ao criar usuário:', authError);
      } else {
        authUserId = authData.user.id;
        console.log('Usuário criado:', authUserId);
      }
    }

    // Inserir compra
    const { error: purchaseError } = await supabase.from('purchases').insert({
      user_email: payer.email,
      products: products,
      total_amount: totalAmount,
      payment_status: payment.status,
      payment_id: payment.id.toString(),
      password_hash: passwordHash,
      auth_user_id: authUserId,
    });

    if (purchaseError) {
      console.error('Erro ao registrar compra:', purchaseError);
    }

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
    console.error('Erro no process-payment:', error);
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
