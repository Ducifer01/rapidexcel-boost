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
    
    const { product_ids, payer, back_urls, password } = await req.json();
    logStep('Dados recebidos', { product_ids, payer_email: payer?.email });

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

    const externalRef = crypto.randomUUID();
    logStep('Reference ID gerado', { externalRef });

    // Criar preferência de pagamento no MercadoPago
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
      external_reference: externalRef,
      auto_return: 'approved',
      statement_descriptor: 'PLANILHAEXPRESS',
      payment_methods: {
        excluded_payment_types: [],
        installments: 12,
        default_installments: 1,
      },
    };

    logStep('Enviando para MercadoPago', { url: 'https://api.mercadopago.com/checkout/preferences' });

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

    // Registrar compra no Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Hash da senha usando Web Crypto API do Deno
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const totalAmount = items.reduce((sum: number, item: any) => sum + (item.unit_price * item.quantity), 0);

    logStep('Registrando no Supabase', { email: payer.email, total: totalAmount });

    const { error: insertError } = await supabase.from('purchases').insert({
      user_email: payer.email,
      products: items.map((item: any) => item.title),
      total_amount: totalAmount,
      payment_status: 'pending',
      payment_id: externalRef,
      password_hash: passwordHash,
    });

    if (insertError) {
      logStep('ERRO ao inserir no Supabase', insertError);
      throw new Error(`Erro ao registrar compra: ${insertError.message}`);
    }

    logStep('Compra registrada com sucesso');

    return new Response(
      JSON.stringify({
        preference_id: preference.id,
        init_point: preference.init_point,
        external_reference: externalRef,
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
