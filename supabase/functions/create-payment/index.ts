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
    const { items, payer, back_urls } = await req.json();

    // Obtenha o Access Token do MercadoPago das variáveis de ambiente
    // Configure isso no painel do Supabase > Edge Functions > Secrets
    const mercadoPagoAccessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    
    if (!mercadoPagoAccessToken) {
      throw new Error('MercadoPago Access Token não configurado');
    }

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
      payment_id: preference.id,
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
