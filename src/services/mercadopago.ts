/**
 * Serviço de integração com MercadoPago
 * 
 * Para configurar:
 * 1. Obtenha suas credenciais no painel do MercadoPago
 * 2. Adicione o Public Key abaixo
 * 3. Configure o Access Token no backend/edge function
 * 4. Atualize a URL de notificação de webhook
 */

export interface MercadoPagoConfig {
  publicKey: string; // Adicione sua Public Key aqui
  accessToken?: string; // Será usado no backend
}

// Configuração do MercadoPago
// IMPORTANTE: Adicione suas credenciais aqui
export const mercadoPagoConfig: MercadoPagoConfig = {
  publicKey: 'SEU_PUBLIC_KEY_AQUI', // Substitua pela sua Public Key
};

export interface CheckoutData {
  items: {
    title: string;
    quantity: number;
    unit_price: number;
    description?: string;
  }[];
  payer: {
    email: string;
    name?: string;
  };
  back_urls?: {
    success: string;
    failure: string;
    pending: string;
  };
  notification_url?: string;
}

/**
 * Cria uma preferência de pagamento no MercadoPago
 * Esta função deve ser chamada através de uma Edge Function para segurança
 */
export const createPaymentPreference = async (data: CheckoutData) => {
  try {
    // Esta chamada deve ser feita através de uma Edge Function
    // que possui o Access Token do MercadoPago de forma segura
    const response = await fetch('/api/create-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Erro ao criar preferência de pagamento');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Erro no MercadoPago:', error);
    throw error;
  }
};

/**
 * Redireciona para o checkout do MercadoPago
 */
export const redirectToCheckout = (preferenceId: string) => {
  const checkoutUrl = `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${preferenceId}`;
  window.location.href = checkoutUrl;
};

/**
 * Pacotes de produtos disponíveis
 */
export const productPackages = {
  pack1: {
    id: 'pack_1',
    name: 'Pack 1 - 6.000 Planilhas Excel',
    description: 'Acesso a 6.000 planilhas editáveis em todas as categorias',
    price: 12.99,
  },
  pack2: {
    id: 'pack_2',
    name: 'Pack 2 - Planner + 50 Dashboards',
    description: 'Planner de Organização Financeira + 50 Dashboards Premium',
    price: 25.00,
    promoPrice: 12.99, // Preço promocional quando comprado com Pack 1
  },
  combo: {
    id: 'combo',
    name: 'Combo Completo',
    description: 'Pack 1 + Pack 2 - Mais de 6.050 recursos',
    originalPrice: 37.99,
    price: 25.98,
  },
};
