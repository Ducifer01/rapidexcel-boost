import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  console.log(`[CREATE-PAYMENT] ${step}`, details ? JSON.stringify(details) : '');
};

// PRODUTOS VÁLIDOS - Definição centralizada (server-side source of truth)
const VALID_PRODUCTS = {
  'pack_1': { 
    title: 'Pack Excel Completo Pro - 13.000 Planilhas', 
    price: 12.99,
    description: 'Acesso completo a mais de 13.000 planilhas Excel profissionais + 50 dashboards extras premium'
  },
  'pack_2': { 
    title: 'Pack Office Premium - Templates Word + Slides PowerPoint', 
    price: 29.99,
    description: 'Upgrade completo: +2.000 templates Word + 50.000 slides PowerPoint + BÔNUS: 6.000 planilhas Excel extras'
  },
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep('Iniciando criação de pagamento');
    
  const {
    product_ids = [],
    payer,
    back_urls = {
      success: 'https://seusite.com/success',
      failure: 'https://seusite.com/failure',
      pending: 'https://seusite.com/pending',
    },
    password,
    authenticated_user_id,
  } = await req.json();
    logStep('Dados recebidos', { product_ids, has_payer: !!payer, authenticated: !!authenticated_user_id });

    // Validar IDs dos produtos
    if (!product_ids || !Array.isArray(product_ids) || product_ids.length === 0) {
      throw new Error('product_ids inválido ou vazio');
    }

    // Criar cliente Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

  // Validação: pack_2 só pode ser comprado junto com pack_1
  if (product_ids.includes('pack_2') && !product_ids.includes('pack_1')) {
    throw new Error('Pack Office Premium deve ser comprado junto com Pack Excel');
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
      if (!payer.email || !payer.name) {
        throw new Error('Dados do comprador incompletos');
      }

      if (password.length < 6) {
        throw new Error('Senha inválida');
      }

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
      // O Brick vai coletar os dados depois
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
    if (payer && payer.email) {
      preferenceData.payer = {
        email: payer.email,
        ...(payer.name && { name: payer.name }),
        ...(payer.identification && {
          identification: payer.identification,
        }),
        ...(payer.phone && { phone: payer.phone }),
      };
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
