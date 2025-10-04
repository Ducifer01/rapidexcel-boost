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
    const notification = await req.json();
    
    console.log('Webhook recebido:', notification);

    // Verificar se é uma notificação de pagamento
    if (notification.type !== 'payment') {
      return new Response('OK', { status: 200 });
    }

    const mercadoPagoAccessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    
    // Buscar detalhes do pagamento no MercadoPago
    const paymentResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${notification.data.id}`,
      {
        headers: {
          'Authorization': `Bearer ${mercadoPagoAccessToken}`,
        },
      }
    );

    const payment = await paymentResponse.json();

    // Atualizar status no Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error } = await supabase
      .from('purchases')
      .update({
        payment_status: payment.status,
        payment_id: payment.id.toString(),
      })
      .eq('payment_id', payment.external_reference || payment.id.toString());

    if (error) {
      console.error('Erro ao atualizar compra:', error);
      throw error;
    }

    // Se o pagamento foi aprovado, enviar email com acesso
    if (payment.status === 'approved') {
      // Aqui você pode adicionar lógica para enviar email ou ativar acesso
      console.log('Pagamento aprovado para:', payment.payer.email);
    }

    return new Response('OK', { 
      headers: corsHeaders,
      status: 200 
    });
  } catch (error) {
    console.error('Erro no webhook:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
