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

    // Buscar a compra pelo external_reference
    const externalRef = payment.external_reference || payment.id.toString();
    logStep('Buscando compra', { externalRef });

    const { data: purchase, error: fetchError } = await supabase
      .from('purchases')
      .select('*')
      .eq('payment_id', externalRef)
      .single();

    if (fetchError || !purchase) {
      logStep('ERRO ao buscar compra', fetchError);
      throw new Error(`Compra não encontrada: ${externalRef}`);
    }

    logStep('Compra encontrada', { 
      id: purchase.id, 
      email: purchase.user_email,
      current_status: purchase.payment_status 
    });

    // Se o pagamento foi aprovado, criar usuário no Supabase Auth
    let authUserId = purchase.auth_user_id;
    
    if (payment.status === 'approved' && !purchase.auth_user_id) {
      logStep('Pagamento aprovado! Criando usuário', { email: purchase.user_email });
      
      // Criar usuário no Supabase Auth usando Service Role
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: purchase.user_email,
        password: purchase.password_hash, // Usar hash como senha temporária
        email_confirm: true, // Confirmar email automaticamente
        user_metadata: {
          name: payment.payer?.name || payment.payer?.first_name || purchase.user_email.split('@')[0],
          cpf: payment.payer?.identification?.number,
          purchase_id: purchase.id,
        }
      });

      if (authError) {
        logStep('ERRO ao criar usuário', authError);
        // Continuar mesmo com erro - admin pode criar manualmente
      } else if (authData.user) {
        authUserId = authData.user.id;
        logStep('Usuário criado com sucesso', { userId: authUserId });
      }
    }

    // Atualizar status da compra e associar ao usuário
    logStep('Atualizando compra', { 
      status: payment.status, 
      authUserId,
      clearPassword: payment.status === 'approved' 
    });

    const { error: updateError } = await supabase
      .from('purchases')
      .update({
        payment_status: payment.status,
        payment_id: payment.id.toString(),
        auth_user_id: authUserId,
        password_hash: payment.status === 'approved' ? null : purchase.password_hash, // Limpar senha após criar usuário
        updated_at: new Date().toISOString(),
      })
      .eq('payment_id', externalRef);

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
