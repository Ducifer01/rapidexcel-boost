import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, data?: any) => {
  console.log(`[PROCESS-PAYMENT] ${step}`, data ? JSON.stringify(data, null, 2) : '');
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep('Iniciando process-payment');
    
    const body = await req.json();
    logStep('Body recebido', { hasExternalRef: !!body.external_reference });
    
    const { external_reference, ...mpFormData } = body;
    
    if (!external_reference) {
      throw new Error('external_reference é obrigatório');
    }
    
    logStep('External reference', { external_reference });
    
    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    if (!accessToken) {
      throw new Error('MERCADOPAGO_ACCESS_TOKEN não configurado');
    }
    
    // Não passar entity_type no payer (evita warnings)
    if (mpFormData.payer && mpFormData.payer.entity_type) {
      delete mpFormData.payer.entity_type;
    }
    
    logStep('Criando pagamento no Mercado Pago');
    
    const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'X-Idempotency-Key': crypto.randomUUID(),
      },
      body: JSON.stringify({
        ...mpFormData,
        external_reference,
      }),
    });
    
    const responseText = await mpResponse.text();
    logStep('Resposta do MP', { status: mpResponse.status, hasResponse: !!responseText });
    
    if (!mpResponse.ok) {
      throw new Error(`Mercado Pago error: ${responseText}`);
    }
    
    const mpPayment = JSON.parse(responseText);
    logStep('Pagamento criado no MP', { 
      id: mpPayment.id, 
      status: mpPayment.status,
      payment_type_id: mpPayment.payment_type_id 
    });
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    logStep('Atualizando purchase no banco', { external_reference });
    
    const { error: updateError } = await supabase
      .from('purchases')
      .update({
        payment_id: String(mpPayment.id),
        payment_status: mpPayment.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', external_reference);
    
    if (updateError) {
      logStep('Erro ao atualizar purchase', updateError);
      throw updateError;
    }
    
    logStep('Purchase atualizada com sucesso');
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        payment: mpPayment,
        status: mpPayment.status 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
    
  } catch (error) {
    logStep('Erro no process-payment', error);
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
