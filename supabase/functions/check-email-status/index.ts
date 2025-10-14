import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation schema
const EmailSchema = z.object({
  email: z.string().trim().email('Email inválido').max(255, 'Email muito longo')
});

// Rate limiting helper
async function checkRateLimit(supabase: any, identifier: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('check_rate_limit', {
      _identifier: identifier,
      _function_name: 'check-email-status',
      _max_requests: 10,
      _window_minutes: 1
    });
    
    if (error) {
      console.error('Rate limit check error:', error);
      return true; // Allow on error
    }
    
    return data === true;
  } catch (error) {
    console.error('Rate limit exception:', error);
    return true; // Allow on error
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Rate limiting - 10 requests per minute per IP
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    
    const rateLimitOk = await checkRateLimit(supabaseAdmin, clientIp);
    
    if (!rateLimitOk) {
      return new Response(
        JSON.stringify({ error: 'Muitas requisições. Aguarde um momento e tente novamente.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
      );
    }

    // Validate request
    const rawBody = await req.json();
    const validationResult = EmailSchema.safeParse(rawBody);
    
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ error: 'Email inválido' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const { email } = validationResult.data;

    // Verificar se existe usuário com este email usando listUsers
    const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = usersData?.users?.find((u: any) => u.email === email);
    
    const exists = !!existingUser;

    return new Response(
      JSON.stringify({ 
        exists,
        message: exists 
          ? 'Email já cadastrado. Faça login para comprar novos produtos.' 
          : 'Email disponível para cadastro.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error: any) {
    console.error('Erro ao verificar email:', error);
    return new Response(
      JSON.stringify({ error: 'Erro ao verificar email' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});