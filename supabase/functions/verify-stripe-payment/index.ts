import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { session_id } = await req.json();

    if (!session_id) {
      throw new Error("session_id é obrigatório");
    }

    // Inicializar Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Buscar sessão do Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (!session) {
      throw new Error("Sessão não encontrada");
    }

    console.log("Status da sessão:", session.payment_status);

    // Inicializar Supabase
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Buscar compra no banco
    const { data: purchase, error: fetchError } = await supabase
      .from("purchases")
      .select("*")
      .eq("stripe_session_id", session_id)
      .single();

    if (fetchError) {
      console.error("Erro ao buscar compra:", fetchError);
      throw new Error("Compra não encontrada");
    }

    // Se o pagamento foi aprovado e ainda não criamos o usuário
    if (session.payment_status === "paid" && !purchase.auth_user_id) {
      const userEmail = purchase.user_email;
      
      // Gerar senha temporária (o usuário pode mudar depois)
      const tempPassword = `Temp${Math.random().toString(36).slice(-8)}!`;

      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userEmail,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          created_from_purchase: true,
          purchase_id: purchase.id,
        },
      });

      if (authError) {
        console.error("Erro ao criar usuário:", authError);
        
        // Se o usuário já existe, buscar o ID
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const existingUser = existingUsers?.users.find(u => u.email === userEmail);
        
        if (existingUser) {
          // Atualizar compra com o user_id existente
          const { error: updateError } = await supabase
            .from("purchases")
            .update({
              payment_status: "succeeded",
              auth_user_id: existingUser.id,
              stripe_payment_intent_id: session.payment_intent as string,
              updated_at: new Date().toISOString(),
            })
            .eq("id", purchase.id);

          if (updateError) {
            console.error("Erro ao atualizar compra:", updateError);
          }

          return new Response(
            JSON.stringify({
              success: true,
              payment_status: "succeeded",
              user_exists: true,
              email: userEmail,
            }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 200,
            }
          );
        }
        
        throw new Error("Erro ao criar usuário");
      }

      // Atualizar compra com status succeeded e user_id
      const { error: updateError } = await supabase
        .from("purchases")
        .update({
          payment_status: "succeeded",
          auth_user_id: authData.user.id,
          stripe_payment_intent_id: session.payment_intent as string,
          updated_at: new Date().toISOString(),
        })
        .eq("id", purchase.id);

      if (updateError) {
        console.error("Erro ao atualizar compra:", updateError);
        throw new Error("Erro ao atualizar compra");
      }

      console.log("Pagamento verificado e usuário criado:", authData.user.id);

      return new Response(
        JSON.stringify({
          success: true,
          payment_status: "succeeded",
          user_created: true,
          email: userEmail,
          temp_password: tempPassword, // Enviar senha temporária
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Se já tem auth_user_id, apenas retornar status
    return new Response(
      JSON.stringify({
        success: session.payment_status === "paid",
        payment_status: session.payment_status === "paid" ? "succeeded" : purchase.payment_status,
        user_exists: !!purchase.auth_user_id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Erro ao verificar pagamento:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Erro ao verificar pagamento",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
