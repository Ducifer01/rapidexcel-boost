import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { product_ids, payer, back_urls } = await req.json();

    // VALIDAÇÃO DE SEGURANÇA: Preços são definidos NO SERVIDOR
    // NUNCA confiar em preços vindos do frontend!
    const VALID_PRODUCTS = {
      'pack_1': { title: 'Planilhas 6k Pro - 6.000 Planilhas Excel', price: 12.99 },
      'pack_2': { title: 'Dashboards+Bônus - Planner + 50 Dashboards', price: 12.99 },
    };

    // Validar IDs dos produtos
    if (!product_ids || !Array.isArray(product_ids)) {
      throw new Error('product_ids inválido');
    }

    // Validar que Pack 2 nunca vem sozinho
    if (product_ids.length === 1 && product_ids[0] === 'pack_2') {
      throw new Error('Pack 2 só pode ser comprado junto com Pack 1');
    }

    // Construir items com preços SEGUROS do servidor
    const items = product_ids.map((id: string) => {
      const product = VALID_PRODUCTS[id as keyof typeof VALID_PRODUCTS];
      if (!product) {
        throw new Error(`Produto inválido: ${id}`);
      }
      return {
        title: product.title,
        quantity: 1,
        unit_price: product.price,
      };
    });

    // Obtenha o Access Token do MercadoPago das variáveis de ambiente
    // Configure isso no painel do Supabase > Edge Functions > Secrets
    const mercadoPagoAccessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    
    if (!mercadoPagoAccessToken) {
      throw new Error('MercadoPago Access Token não configurado');
    }

    const externalRef = crypto.randomUUID();

    // Criar preferência de pagamento no MercadoPago
    const preferenceData = {
      items,
      payer,
      back_urls: back_urls || {
        success: `${req.headers.get('origin')}/success`,
        failure: `${req.headers.get('origin')}/failure`,
        pending: `${req.headers.get('origin')}/pending`,
      },
      notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/payment-webhook`,
      external_reference: externalRef,
      auto_return: 'approved',
    };

    const mercadoPagoResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mercadoPagoAccessToken}`,
      },
      body: JSON.stringify(preferenceData),
    });

    if (!mercadoPagoResponse.ok) {
      const error = await mercadoPagoResponse.text();
      console.error('Erro do MercadoPago:', error);
      throw new Error('Erro ao criar preferência no MercadoPago');
    }

    const preference = await mercadoPagoResponse.json();

    // Registrar compra no Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    await supabase.from('purchases').insert({
      user_email: payer.email,
      products: items.map((item: any) => item.title),
      total_amount: items.reduce((sum: number, item: any) => sum + (item.unit_price * item.quantity), 0),
      payment_status: 'pending',
      payment_id: externalRef,
    });

    return new Response(
      JSON.stringify({
        preference_id: preference.id,
        init_point: preference.init_point,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Erro:', error);
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
