import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { PRODUCTS, getProductById } from '@/lib/products';
import { CountdownTimer } from '@/components/checkout/CountdownTimer';
import { ViewCounter } from '@/components/checkout/ViewCounter';
import { TrustBadges } from '@/components/checkout/TrustBadges';
import { MiniTestimonials } from '@/components/checkout/MiniTestimonials';
import { UpsellModal } from '@/components/checkout/UpsellModal';

import { ArrowLeft, ArrowRight, Check, Loader2, Sparkles, TrendingUp, Info } from 'lucide-react';
import { useFacebookPixel } from '@/hooks/useFacebookPixel';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { trackEvent } = useFacebookPixel();
  
  // Step 1: Seleção de produtos
  const preSelectPack2 = location.state?.preSelectPack2 || false;
  const [selectedProducts, setSelectedProducts] = useState<string[]>(
    preSelectPack2 ? ['pack_1', 'pack_2'] : ['pack_1']
  );
  const [includeUpsell, setIncludeUpsell] = useState(preSelectPack2);

  // Step 2: Dados do comprador
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showUpsellModal, setShowUpsellModal] = useState(false);

  // Facebook Pixel: ViewContent na página de checkout
  useEffect(() => {
    trackEvent('ViewContent', {
      content_name: 'Checkout Page',
      content_category: 'Checkout',
      content_ids: selectedProducts,
      content_type: 'product',
      value: calculateTotal(),
      currency: 'BRL',
      num_items: selectedProducts.length
    });
  }, []);

  useEffect(() => {
    if (includeUpsell && !selectedProducts.includes('pack_2')) {
      setSelectedProducts(['pack_1', 'pack_2']);
      
      // Facebook Pixel: AddToCart quando adiciona Pack 2
      const pack2 = getProductById('pack_2');
      if (pack2) {
        trackEvent('AddToCart', {
          content_ids: ['pack_2'],
          content_name: pack2.name,
          content_type: 'product',
          value: pack2.price,
          currency: 'BRL'
        });
      }
    } else if (!includeUpsell && selectedProducts.includes('pack_2')) {
      setSelectedProducts(['pack_1']);
    }
  }, [includeUpsell]);

  const calculateTotal = () => {
    return selectedProducts.reduce((sum, productId) => {
      const product = getProductById(productId);
      return sum + (product?.price || 0);
    }, 0);
  };

  const calculateSavings = () => {
    return selectedProducts.reduce((sum, productId) => {
      const product = getProductById(productId);
      return sum + (product?.savings || 0);
    }, 0);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name || formData.name.length < 3) {
      errors.name = 'Nome deve ter no mínimo 3 caracteres';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      errors.email = 'Email inválido';
    }

    if (!formData.password || formData.password.length < 6) {
      errors.password = 'Senha deve ter no mínimo 6 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Senhas não coincidem';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleContinueToForm = () => {
    // Facebook Pixel: InitiateCheckout quando usuário avança para dados de pagamento
    trackEvent('InitiateCheckout', {
      content_ids: selectedProducts,
      contents: selectedProducts.map(id => {
        const product = getProductById(id);
        return {
          id: id,
          quantity: 1,
          item_price: product?.price
        };
      }),
      value: calculateTotal(),
      currency: 'BRL',
      num_items: selectedProducts.length
    });

    // Se Pack 2 não estiver selecionado, mostrar modal de upsell
    if (!includeUpsell) {
      setShowUpsellModal(true);
    } else {
      setStep(2);
    }
  };

  const handleUpsellAccept = () => {
    setIncludeUpsell(true);
    setShowUpsellModal(false);
    setStep(2);
  };

  const handleUpsellDecline = () => {
    setShowUpsellModal(false);
    setStep(2);
  };

  const handleContinueToPayment = async () => {
    if (!validateForm()) {
      toast.error('Por favor, corrija os erros no formulário');
      return;
    }

    // Facebook Pixel: AddPaymentInfo quando formulário é validado
    trackEvent('AddPaymentInfo', {
      content_ids: selectedProducts,
      value: calculateTotal(),
      currency: 'BRL'
    });

    // Advanced Matching: informar email ao Pixel para melhor atribuição
    try {
      if (typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('init', '2708262289551049', {
          em: formData.email,
          external_id: formData.email,
        });
      }
      // Guardar dados do comprador para o success
      localStorage.setItem('checkout_user_data', JSON.stringify({
        email: formData.email,
        name: formData.name,
      }));
    } catch (_) {}

    setLoading(true);

    try {
      const payer = {
        name: formData.name,
        email: formData.email,
      };

      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          product_ids: selectedProducts,
          payer,
          password: formData.password,
          back_urls: {
            success: `${window.location.origin}/success`,
            failure: `${window.location.origin}/failure`,
            pending: `${window.location.origin}/pending`,
          },
        },
      });

      if (error) throw error;

      if (data?.auth_tokens) {
        localStorage.setItem('pending_auth_tokens', JSON.stringify(data.auth_tokens));
      }

      // Salvar dados da compra para o evento Purchase do Facebook Pixel
      localStorage.setItem('checkout_purchase_data', JSON.stringify({
        total: calculateTotal(),
        products: selectedProducts
      }));

      if (data?.init_point) {
        window.location.href = data.init_point;
      } else {
        throw new Error('Link de pagamento não disponível');
      }
    } catch (error: any) {
      console.error('Erro ao criar pagamento:', error);
      
      // Melhor tratamento de erro para email duplicado
      const errorMessage = error.message || '';
      if (errorMessage.includes('Email já cadastrado') || errorMessage.includes('email_exists')) {
        toast.error('Este email já está cadastrado. Por favor, faça login na área de membros para comprar novos produtos.', {
          duration: 6000,
          action: {
            label: 'Ir para Login',
            onClick: () => navigate('/login'),
          },
        });
      } else {
        toast.error(errorMessage || 'Erro ao processar pagamento. Tente novamente.');
      }
      
      setLoading(false);
    }
  };

  const pack1 = getProductById('pack_1');
  const pack2 = getProductById('pack_2');

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-4 sm:py-6 md:py-8 px-3 sm:px-4">
      <UpsellModal 
        open={showUpsellModal}
        onClose={() => setShowUpsellModal(false)}
        onAccept={handleUpsellAccept}
        onDecline={handleUpsellDecline}
      />
      
      <div className="container max-w-6xl mx-auto">
        {/* Header - Mobile First */}
        <div className="text-center mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">Checkout Seguro</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Complete em 2 passos</p>
          <div className="flex justify-center mt-3 sm:mt-4">
            <ViewCounter />
          </div>
        </div>

        {/* Progress Bar - Mobile Optimized */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <div className="flex items-center justify-center gap-2 sm:gap-4 max-w-md mx-auto">
            <div className={`flex items-center gap-1.5 sm:gap-2 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base font-bold ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                {step > 1 ? <Check className="h-5 w-5" /> : '1'}
              </div>
              <span className="font-medium text-xs sm:text-sm">Produtos</span>
            </div>
            <div className={`h-1 w-12 sm:w-16 rounded ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`flex items-center gap-1.5 sm:gap-2 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base font-bold ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                2
              </div>
              <span className="font-medium text-xs sm:text-sm">Dados</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            {step === 1 && (
              <div className="space-y-4 sm:space-y-6 animate-fade-in">
                <CountdownTimer />

                {/* Pack 1 - Principal - Mobile Optimized */}
                <Card className="border-2 border-primary/50">
                  <CardHeader className="p-4 sm:p-6">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <CardTitle className="text-base sm:text-lg md:text-xl leading-tight flex-1">
                          {pack1?.name}
                        </CardTitle>
                        <div className="text-right flex-shrink-0">
                          <div className="text-xl sm:text-2xl font-black text-primary whitespace-nowrap">
                            R$ {pack1?.price.toFixed(2)}
                          </div>
                          <div className="text-[10px] sm:text-xs text-muted-foreground line-through">
                            De R$ {pack1?.originalPrice?.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      <CardDescription className="text-xs sm:text-sm leading-relaxed">
                        {pack1?.description}
                      </CardDescription>
                    </div>
                  </CardHeader>
                </Card>

                {/* Pack 2 - Upsell - Mobile Optimized */}
                <Card className="border-2 border-primary relative overflow-hidden">
                  <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-primary text-primary-foreground text-[10px] sm:text-xs font-bold px-2 py-1 rounded-full z-10">
                    MAIS VENDIDO
                  </div>
                  <CardHeader className="p-4 sm:p-6 pt-10 sm:pt-12">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="upsell"
                          checked={includeUpsell}
                          onCheckedChange={(checked) => setIncludeUpsell(checked as boolean)}
                          className="mt-1 h-6 w-6 sm:h-5 sm:w-5"
                        />
                        <label htmlFor="upsell" className="cursor-pointer flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-base sm:text-lg md:text-xl flex items-center gap-2 leading-tight flex-1">
                              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                              <span>{pack2?.name}</span>
                            </CardTitle>
                            <div className="text-right flex-shrink-0">
                              <div className="text-lg sm:text-xl md:text-2xl font-black text-primary whitespace-nowrap">
                                +R$ {pack2?.price.toFixed(2)}
                              </div>
                              <div className="text-[10px] sm:text-xs text-muted-foreground line-through">
                                De R$ {pack2?.originalPrice?.toFixed(2)}
                              </div>
                            </div>
                          </div>
                          <CardDescription className="text-xs sm:text-sm leading-relaxed">
                            {pack2?.description}
                          </CardDescription>
                          <div className="p-3 bg-primary/10 rounded-lg">
                            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-primary">
                              <TrendingUp className="h-4 w-4 flex-shrink-0" />
                              <span>Economize R$ {pack2?.savings?.toFixed(2)}!</span>
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <TrustBadges />

                <Button
                  onClick={handleContinueToForm}
                  className="w-full h-14 sm:h-16 text-base sm:text-lg font-bold"
                  size="lg"
                >
                  <span>Continuar para Pagamento</span>
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 sm:space-y-6 animate-fade-in">
                <Card>
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-lg sm:text-xl">Dados do Comprador</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Preencha para criar sua conta de acesso
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
                    <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-3 sm:p-4">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-semibold text-foreground">
                            🔐 Credenciais de Acesso
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                            Use email e senha para acessar a área de membros e fazer download dos produtos.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm sm:text-base">Nome Completo *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Seu nome completo"
                        className={`h-12 sm:h-11 text-base ${formErrors.name ? 'border-destructive' : ''}`}
                      />
                      {formErrors.name && (
                        <p className="text-xs sm:text-sm text-destructive">{formErrors.name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm sm:text-base">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="seu@email.com"
                        className={`h-12 sm:h-11 text-base ${formErrors.email ? 'border-destructive' : ''}`}
                      />
                      {formErrors.email && (
                        <p className="text-xs sm:text-sm text-destructive">{formErrors.email}</p>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm sm:text-base">Senha *</Label>
                        <Input
                          id="password"
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="Mínimo 6 caracteres"
                          className={`h-12 sm:h-11 text-base ${formErrors.password ? 'border-destructive' : ''}`}
                        />
                        {formErrors.password && (
                          <p className="text-xs sm:text-sm text-destructive">{formErrors.password}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-sm sm:text-base">Confirmar Senha *</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          placeholder="Repita a senha"
                          className={`h-12 sm:h-11 text-base ${formErrors.confirmPassword ? 'border-destructive' : ''}`}
                        />
                        {formErrors.confirmPassword && (
                          <p className="text-xs sm:text-sm text-destructive">{formErrors.confirmPassword}</p>
                        )}
                      </div>
                    </div>

                  </CardContent>
                </Card>

                <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
                  <Button
                    onClick={() => setStep(1)}
                    variant="outline"
                    className="w-full sm:flex-1 h-12 sm:h-11"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar
                  </Button>
                  <Button
                    onClick={handleContinueToPayment}
                    disabled={loading}
                    className="w-full sm:flex-1 h-14 sm:h-16 text-base sm:text-lg font-bold"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        <span>Processando...</span>
                      </>
                    ) : (
                      <>
                        <span>Ir para Pagamento</span>
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Resumo - Mobile First */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="lg:sticky lg:top-8 space-y-4 sm:space-y-6">
              <Card className="border-2">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg">Resumo do Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
                  {selectedProducts.map((productId) => {
                    const product = getProductById(productId);
                    return (
                      <div key={productId} className="flex justify-between items-start pb-3 border-b gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-xs sm:text-sm leading-tight">{product?.name}</p>
                          {product?.isUpsell && (
                            <span className="text-[10px] sm:text-xs text-primary font-semibold">Upgrade</span>
                          )}
                        </div>
                        <p className="font-bold text-sm sm:text-base whitespace-nowrap">R$ {product?.price.toFixed(2)}</p>
                      </div>
                    );
                  })}

                  <div className="pt-3 sm:pt-4 space-y-1 sm:space-y-2">
                    <div className="flex justify-between text-base sm:text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary text-lg sm:text-xl">R$ {calculateTotal().toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground text-right font-medium">
                      💰 Economiza R$ {calculateSavings().toFixed(2)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-muted/50 hidden lg:block">
                <CardHeader className="p-4">
                  <CardTitle className="text-sm sm:text-base">Depoimentos</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <MiniTestimonials />
                </CardContent>
              </Card>

              <div className="text-center space-y-2 hidden lg:block">
                <CountdownTimer />
                <TrustBadges />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
