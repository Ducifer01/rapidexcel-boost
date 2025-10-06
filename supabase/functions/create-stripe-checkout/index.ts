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
    const { product_ids, payer } = await req.json();

    if (!product_ids || !Array.isArray(product_ids) || product_ids.length === 0) {
      throw new Error("product_ids é obrigatório e deve ser um array");
    }

    if (!payer?.email || !payer?.name) {
      throw new Error("Informações do comprador são obrigatórias");
    }

    // Produtos disponíveis
    const products: Record<string, { price_id: string; name: string; amount: number }> = {
      pack_1: {
        price_id: "price_1SF9Oo943aLJBKu0ZutVdhv8",
        name: "Planilhas 6k",
        amount: 19.90
      },
      pack_2: {
        price_id: "price_1SF9Q5943aLJBKu0qhPUVc3S",
        name: "DashBoard - Bonus",
        amount: 6.08
      }
    };

    // Validar produtos
    const selectedProducts = product_ids.filter((id: string) => products[id]);
    if (selectedProducts.length === 0) {
      throw new Error("Nenhum produto válido selecionado");
    }

    // Calcular total
    const totalAmount = selectedProducts.reduce((sum: number, id: string) => sum + products[id].amount, 0);

    // Inicializar Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Verificar se customer existe
    const customers = await stripe.customers.list({ email: payer.email, limit: 1 });
    let customerId: string | undefined;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const newCustomer = await stripe.customers.create({
        email: payer.email,
        name: payer.name,
      });
      customerId = newCustomer.id;
    }

    // Criar line items para o Stripe
    const lineItems = selectedProducts.map((id: string) => ({
      price: products[id].price_id,
      quantity: 1,
    }));

    // Criar sessão de checkout do Stripe
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: lineItems,
      mode: "payment",
      success_url: `${req.headers.get("origin")}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/checkout`,
      metadata: {
        product_ids: selectedProducts.join(","),
        customer_name: payer.name,
      },
    });

    // Inicializar Supabase
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Criar registro da compra com status pending
    const productNames = selectedProducts.map((id: string) => products[id].name);
    
    const { error: insertError } = await supabase
      .from("purchases")
      .insert({
        user_email: payer.email,
        products: productNames,
        total_amount: totalAmount,
        payment_status: "pending",
        payment_id: session.id,
        stripe_session_id: session.id,
        stripe_customer_id: customerId,
      });

    if (insertError) {
      console.error("Erro ao inserir compra:", insertError);
      throw new Error("Erro ao registrar compra");
    }

    console.log("Checkout criado com sucesso:", session.id);

    return new Response(
      JSON.stringify({ 
        url: session.url,
        session_id: session.id 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Erro ao criar checkout:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Erro ao criar checkout" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
