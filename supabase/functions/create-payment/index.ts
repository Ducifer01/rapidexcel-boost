import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  console.log(`[CREATE-PAYMENT] ${step}`, details ? JSON.stringify(details) : '');
};

// Validation schemas
const PayerSchema = z.object({
  name: z.string().trim().min(3, 'Nome deve ter no mínimo 3 caracteres').max(100, 'Nome muito longo'),
  email: z.string().trim().email('Email inválido').max(255, 'Email muito longo'),
  identification: z.object({
    type: z.literal('CPF'),
    number: z.string().regex(/^\d{11}$/, 'CPF deve conter 11 dígitos')
  }).optional(),
  phone: z.object({
    area_code: z.string().regex(/^\d{2}$/, 'DDD deve conter 2 dígitos'),
    number: z.string().regex(/^\d{8,9}$/, 'Telefone deve conter 8 ou 9 dígitos')
  }).optional()
});

const PasswordSchema = z.string()
  .min(6, 'Senha deve ter no mínimo 6 caracteres')
  .max(128, 'Senha muito longa');

const RequestSchema = z.object({
  product_ids: z.array(z.string()).min(1, 'Selecione ao menos um produto'),
  payer: PayerSchema.optional(),
  password: PasswordSchema.optional(),
  authenticated_user_id: z.string().uuid().optional(),
  back_urls: z.object({
    success: z.string().url(),
    failure: z.string().url(),
    pending: z.string().url()
  }).optional()
});

// Rate limiting helper
async function checkRateLimit(supabase: any, identifier: string, functionName: string, maxRequests: number): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('check_rate_limit', {
      _identifier: identifier,
      _function_name: functionName,
      _max_requests: maxRequests,
      _window_minutes: 1
    });
    
    if (error) {
      logStep('Rate limit check error', error);
      return true; // Allow on error to avoid blocking legitimate users
    }
    
    return data === true;
  } catch (error) {
    logStep('Rate limit exception', error);
    return true; // Allow on error
  }
}

// PRODUTOS VÁLIDOS - Definição centralizada (server-side source of truth)
const VALID_PRODUCTS = {
  'pack_1': { 
    title: 'Pack Excel Completo Pro - 13.000 Planilhas', 
    price: 12.99,
    description: 'Acesso completo a mais de 13.000 planilhas Excel profissionais + 50 dashboards extras premium'
  },
  'pack_2': { 
    title: 'Pack Office Premium - Templates Word + Slides PowerPoint', 
    price: 39.99,
    description: 'Upgrade completo: +2.000 templates Word + 50.000 slides PowerPoint + BÔNUS: 6.000 planilhas Excel extras'
  },
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep('Iniciando criação de pagamento');
    
    // Create Supabase client early for rate limiting
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Rate limiting - 5 requests per minute per IP
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    
    const rateLimitOk = await checkRateLimit(supabase, clientIp, 'create-payment', 5);
    
    if (!rateLimitOk) {
      logStep('Rate limit exceeded', { ip: clientIp });
      return new Response(
        JSON.stringify({ error: 'Muitas requisições. Aguarde um momento e tente novamente.' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 429 
        }
      );
    }

    // Parse and validate request
    const rawBody = await req.json();
    const validationResult = RequestSchema.safeParse(rawBody);
    
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      logStep('Validation failed', { errors });
      return new Response(
        JSON.stringify({ error: `Dados inválidos: ${errors}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const {
      product_ids,
      payer,
      back_urls = {
        success: 'https://seusite.com/success',
        failure: 'https://seusite.com/failure',
        pending: 'https://seusite.com/pending',
      },
      password,
      authenticated_user_id,
    } = validationResult.data;
    
    logStep('Dados validados', { product_ids, has_payer: !!payer, authenticated: !!authenticated_user_id });

    // Validação: pack_2 só pode ser comprado sozinho na área de membros (usuário autenticado)
    if (product_ids.includes('pack_2') && !product_ids.includes('pack_1') && !authenticated_user_id) {
      throw new Error('Pack Office Premium deve ser comprado junto com Pack Excel no checkout');
    }

    // Construir items com preços SEGUROS do servidor
    const items = product_ids.map((id: string) => {
      const product = VALID_PRODUCTS[id as keyof typeof VALID_PRODUCTS];
      if (!product) {
        throw new Error(`Produto inválido: ${id}`);
      }
      return {
        title: product.title,
        description: product.description,
        quantity: 1,
        unit_price: product.price,
        currency_id: 'BRL',
      };
    });

    logStep('Items validados', { items });

    const mercadoPagoAccessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    
    if (!mercadoPagoAccessToken) {
      logStep('ERRO: Token não configurado');
      throw new Error('MercadoPago Access Token não configurado');
    }

    // Determinar tipo de checkout
    let authUserId: string | null = null;
    let userEmail: string = '';
    let userName: string = '';
    let newUser: any = null;
    
    if (authenticated_user_id) {
      // Usuário já autenticado comprando do Dashboard
      logStep('Compra de usuário autenticado', { userId: authenticated_user_id });
      authUserId = authenticated_user_id;
      
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(authenticated_user_id);
      
      if (userError || !userData.user) {
        logStep('ERRO ao buscar usuário', userError);
        throw new Error('Usuário não encontrado');
      }
      
      userEmail = userData.user.email || '';
      userName = userData.user.user_metadata?.name || userEmail.split('@')[0];
      
      logStep('Dados do usuário carregados', { email: userEmail, name: userName });
    } else if (payer && password) {
      // Fluxo de checkout público com dados completos (criar novo usuário)
      userEmail = payer.email;
      userName = payer.name;
      
      logStep('Criando novo usuário', { email: userEmail });
      
      const { data: userData, error: authError } = await supabase.auth.admin.createUser({
        email: userEmail,
        password: password,
        email_confirm: true,
        user_metadata: {
          name: userName,
        }
      });

      if (authError) {
        if (authError.code === 'email_exists') {
          logStep('ERRO: Email já cadastrado tentou fazer checkout', { email: userEmail });
          throw new Error('Email já cadastrado. Faça login para comprar novos produtos.');
        } else {
          logStep('ERRO ao criar usuário', authError);
          throw new Error(`Erro ao criar usuário: ${authError?.message}`);
        }
      } else if (userData?.user) {
        newUser = userData;
        authUserId = userData.user.id;
        logStep('Usuário criado com sucesso', { userId: authUserId });
      }

      if (!authUserId) {
        throw new Error('Não foi possível obter ID do usuário');
      }
    } else {
      // Checkout anônimo - criar preferência sem dados de usuário
      logStep('Checkout anônimo - preferência sem payer');
    }

    // Registrar compra (anônima ou com auth_user_id)
    const totalAmount = items.reduce((sum: number, item: any) => sum + (item.unit_price * item.quantity), 0);
    
    const purchaseData: any = {
      user_email: userEmail || 'anonymous@temp.com',
      products: items.map((item: any) => item.title),
      total_amount: totalAmount,
      payment_status: 'pending',
      payment_id: 'temp',
    };

    if (authUserId) {
      purchaseData.auth_user_id = authUserId;
    }

    logStep('Registrando compra no Supabase', { email: userEmail || 'anonymous', userId: authUserId, total: totalAmount });

    const { data: purchase, error: insertError } = await supabase
      .from('purchases')
      .insert(purchaseData)
      .select()
      .single();

    if (insertError || !purchase) {
      logStep('ERRO ao inserir compra', insertError);
      throw new Error(`Erro ao registrar compra: ${insertError?.message}`);
    }

    logStep('Compra registrada com sucesso', { purchaseId: purchase.id });

    // Gerar tokens de autenticação (apenas para novos usuários)
    let authTokens = null;
    if (newUser && password) {
      logStep('Gerando tokens de autenticação', { userId: authUserId });
      
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: password,
      });

      if (!signInError && signInData.session) {
        authTokens = {
          access_token: signInData.session.access_token,
          refresh_token: signInData.session.refresh_token,
        };
        logStep('Tokens gerados com sucesso');
      } else {
        logStep('ERRO ao gerar tokens', signInError);
      }
    }

    // Criar preferência no MercadoPago
    const preferenceData: any = {
      items,
      back_urls: back_urls,
      auto_return: 'approved',
      external_reference: purchase.id,
      notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/payment-webhook`,
      statement_descriptor: 'PLANILHAEXPRESS',
      payment_methods: {
        excluded_payment_types: [],
        installments: 12,
        default_installments: 1,
      },
    };

    // Adicionar payer se fornecido
    if (payer) {
      preferenceData.payer = {
        email: payer.email,
        name: payer.name,
      };
      
      // Adicionar identificação e telefone apenas se fornecidos
      if (payer.identification) {
        preferenceData.payer.identification = payer.identification;
      }
      if (payer.phone) {
        preferenceData.payer.phone = payer.phone;
      }
    }

    logStep('Enviando para MercadoPago', { url: 'https://api.mercadopago.com/checkout/preferences', purchaseId: purchase.id, has_payer: !!preferenceData.payer });

    const mercadoPagoResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mercadoPagoAccessToken}`,
      },
      body: JSON.stringify(preferenceData),
    });

    if (!mercadoPagoResponse.ok) {
      const errorText = await mercadoPagoResponse.text();
      logStep('ERRO do MercadoPago', { status: mercadoPagoResponse.status, error: errorText });
      throw new Error(`Erro do MercadoPago: ${errorText}`);
    }

    const preference = await mercadoPagoResponse.json();
    logStep('Preferência criada', { preference_id: preference.id });

    return new Response(
      JSON.stringify({
        preference_id: preference.id,
        init_point: preference.init_point,
        external_reference: purchase.id,
        auth_tokens: authTokens,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    logStep('ERRO GERAL', error);
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