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

    // Buscar a compra pelo external_reference
    const { data: purchase, error: fetchError } = await supabase
      .from('purchases')
      .select('*')
      .eq('payment_id', payment.external_reference || payment.id.toString())
      .single();

    if (fetchError || !purchase) {
      console.error('Erro ao buscar compra:', fetchError);
      throw new Error('Compra não encontrada');
    }

    // Se o pagamento foi aprovado, criar usuário no Supabase Auth
    let authUserId = purchase.auth_user_id;
    
    if (payment.status === 'approved' && !purchase.auth_user_id) {
      console.log('Pagamento aprovado! Criando usuário para:', payment.payer.email);
      
      // Criar usuário no Supabase Auth usando Service Role
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: purchase.user_email,
        password: purchase.password_hash, // Usar hash como senha temporária
        email_confirm: true, // Confirmar email automaticamente
        user_metadata: {
          name: payment.payer.name || payment.payer.first_name,
          cpf: payment.payer.identification?.number,
        }
      });

      if (authError) {
        console.error('Erro ao criar usuário:', authError);
        // Continuar mesmo com erro - admin pode criar manualmente
      } else if (authData.user) {
        authUserId = authData.user.id;
        console.log('Usuário criado com sucesso:', authData.user.id);
      }
    }

    // Atualizar status da compra e associar ao usuário
    const { error: updateError } = await supabase
      .from('purchases')
      .update({
        payment_status: payment.status,
        payment_id: payment.id.toString(),
        auth_user_id: authUserId,
        password_hash: null, // Limpar senha após criar usuário
      })
      .eq('payment_id', payment.external_reference || payment.id.toString());

    if (updateError) {
      console.error('Erro ao atualizar compra:', updateError);
      throw updateError;
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
