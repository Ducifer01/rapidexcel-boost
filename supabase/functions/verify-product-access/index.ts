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
    // Pegar token do usuário autenticado
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Não autenticado');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Verificar usuário autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('Usuário não autenticado');
    }

    const { product_name } = await req.json();

    if (!product_name) {
      throw new Error('Nome do produto não fornecido');
    }

    // Verificar se usuário tem acesso usando a função de segurança
    const { data: hasAccess, error: accessError } = await supabase
      .rpc('user_has_product_access', {
        _user_id: user.id,
        _product_name: product_name
      });

    if (accessError) {
      console.error('Erro ao verificar acesso:', accessError);
      throw new Error('Erro ao verificar acesso');
    }

    if (!hasAccess) {
      return new Response(
        JSON.stringify({ 
          has_access: false, 
          message: 'Você não tem acesso a este produto' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403,
        }
      );
    }

    // Registrar download
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    await supabaseAdmin.from('download_logs').insert({
      user_id: user.id,
      product_name: product_name,
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
    });

    // TODO: Quando os arquivos estiverem no Storage, gerar signed URL aqui
    // const { data: signedUrl } = await supabaseAdmin.storage
    //   .from('products')
    //   .createSignedUrl(`${product_name}.zip`, 3600); // 1 hora

    return new Response(
      JSON.stringify({
        has_access: true,
        message: 'Acesso concedido',
        // download_url: signedUrl?.signedUrl
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
      JSON.stringify({ error: errorMessage, has_access: false }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
