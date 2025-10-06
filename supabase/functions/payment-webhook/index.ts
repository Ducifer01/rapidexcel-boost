import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  console.log(`[PAYMENT-WEBHOOK] ${step}`, details ? JSON.stringify(details) : '');
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const notification = await req.json();
    logStep('Webhook recebido', notification);

    // Verificar se é uma notificação de pagamento
    if (notification.type !== 'payment') {
      logStep('Notificação ignorada (não é payment)', { type: notification.type });
      return new Response('OK', { status: 200 });
    }

    const mercadoPagoAccessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    
    if (!mercadoPagoAccessToken) {
      throw new Error('MERCADOPAGO_ACCESS_TOKEN não configurado');
    }
    
    // Buscar detalhes do pagamento no MercadoPago
    const paymentId = notification.data?.id;
    if (!paymentId) {
      throw new Error('Payment ID não encontrado na notificação');
    }

    logStep('Buscando detalhes do pagamento', { paymentId });

    const paymentResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          'Authorization': `Bearer ${mercadoPagoAccessToken}`,
        },
      }
    );

    if (!paymentResponse.ok) {
      const errorText = await paymentResponse.text();
      logStep('ERRO ao buscar pagamento', { status: paymentResponse.status, error: errorText });
      throw new Error(`Erro ao buscar pagamento: ${errorText}`);
    }

    const payment = await paymentResponse.json();
    logStep('Pagamento encontrado', { 
      id: payment.id, 
      status: payment.status,
      external_reference: payment.external_reference 
    });

    // Atualizar status no Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Buscar a compra pelo external_reference (que é o UUID da compra)
    const purchaseId = payment.external_reference;
    
    if (!purchaseId) {
      logStep('ERRO: external_reference não encontrado no pagamento');
      throw new Error('external_reference ausente no pagamento');
    }

    logStep('Buscando compra pelo ID', { purchaseId });

    const { data: purchase, error: fetchError } = await supabase
      .from('purchases')
      .select('*')
      .eq('id', purchaseId)
      .single();

    if (fetchError || !purchase) {
      logStep('ERRO ao buscar compra', fetchError);
      throw new Error(`Compra não encontrada: ${purchaseId}`);
    }

    logStep('Compra encontrada', { 
      id: purchase.id, 
      email: purchase.user_email,
      userId: purchase.auth_user_id,
      current_status: purchase.payment_status 
    });

    // Atualizar apenas o status do pagamento
    logStep('Atualizando status do pagamento', { 
      old_status: purchase.payment_status,
      new_status: payment.status,
      payment_id: payment.id
    });

    const { error: updateError } = await supabase
      .from('purchases')
      .update({
        payment_status: payment.status,
        payment_id: payment.id.toString(), // ID real do pagamento do MercadoPago
        updated_at: new Date().toISOString(),
      })
      .eq('id', purchaseId);

    if (updateError) {
      logStep('ERRO ao atualizar compra', updateError);
      throw updateError;
    }

    logStep('Webhook processado com sucesso');

    return new Response('OK', { 
      headers: corsHeaders,
      status: 200 
    });
  } catch (error) {
    logStep('ERRO GERAL no webhook', error);
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
