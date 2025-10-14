import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { formatCPF } from '@/lib/cpf-utils';
import { ArrowLeft, ArrowRight, Check, Loader2, Sparkles, TrendingUp } from 'lucide-react';

const Checkout = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Step 1: Seleção de produtos
  const [selectedProducts, setSelectedProducts] = useState<string[]>(['pack_1']);
  const [includeUpsell, setIncludeUpsell] = useState(false);

  // Step 2: Dados do comprador
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    cpf: '',
    phone: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (includeUpsell && !selectedProducts.includes('pack_2')) {
      setSelectedProducts(['pack_1', 'pack_2']);
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
    setStep(2);
  };

  const handleContinueToPayment = async () => {
    if (!validateForm()) {
      toast.error('Por favor, corrija os erros no formulário');
      return;
    }

    setLoading(true);

    try {
      const payer = {
        name: formData.name,
        email: formData.email,
        ...(formData.cpf && {
          identification: {
            type: 'CPF',
            number: formData.cpf.replace(/\D/g, ''),
          },
        }),
        ...(formData.phone && {
          phone: {
            area_code: formData.phone.replace(/\D/g, '').substring(0, 2),
            number: formData.phone.replace(/\D/g, '').substring(2),
          },
        }),
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

      if (data?.init_point) {
        window.location.href = data.init_point;
      } else {
        throw new Error('Link de pagamento não disponível');
      }
    } catch (error: any) {
      console.error('Erro ao criar pagamento:', error);
      toast.error(error.message || 'Erro ao processar pagamento');
      setLoading(false);
    }
  };

  const pack1 = getProductById('pack_1');
  const pack2 = getProductById('pack_2');

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8 px-4">
      <div className="container max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Checkout Seguro</h1>
          <p className="text-muted-foreground">Complete sua compra em 2 passos simples</p>
          <div className="flex justify-center mt-4">
            <ViewCounter />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4 max-w-md mx-auto">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                {step > 1 ? <Check className="h-5 w-5" /> : '1'}
              </div>
              <span className="font-medium hidden sm:inline">Produtos</span>
            </div>
            <div className={`h-0.5 w-16 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                2
              </div>
              <span className="font-medium hidden sm:inline">Dados</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                <CountdownTimer />

                {/* Pack 1 - Principal */}
                <Card className="border-primary/50">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl">{pack1?.name}</CardTitle>
                        <CardDescription className="mt-2">{pack1?.description}</CardDescription>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-2xl font-bold text-primary">
                          R$ {pack1?.price.toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground line-through">
                          De R$ {pack1?.originalPrice?.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Pack 2 - Upsell */}
                <Card className="border-2 border-primary relative overflow-hidden">
                  <div className="absolute top-4 right-4 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                    MAIS VENDIDO
                  </div>
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <Checkbox
                        id="upsell"
                        checked={includeUpsell}
                        onCheckedChange={(checked) => setIncludeUpsell(checked as boolean)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <label htmlFor="upsell" className="cursor-pointer">
                          <CardTitle className="text-xl flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-primary" />
                            {pack2?.name}
                          </CardTitle>
                          <CardDescription className="mt-2">{pack2?.description}</CardDescription>
                          <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                              <TrendingUp className="h-4 w-4" />
                              Economize R$ {pack2?.savings?.toFixed(2)} adicionando agora!
                            </div>
                          </div>
                        </label>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          +R$ {pack2?.price.toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground line-through">
                          De R$ {pack2?.originalPrice?.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <TrustBadges />

                <Button
                  onClick={handleContinueToForm}
                  className="w-full h-14 text-lg"
                  size="lg"
                >
                  Continuar para Pagamento
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-fade-in">
                <Card>
                  <CardHeader>
                    <CardTitle>Dados do Comprador</CardTitle>
                    <CardDescription>
                      Preencha seus dados para criar sua conta de acesso
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome Completo *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Seu nome completo"
                        className={formErrors.name ? 'border-destructive' : ''}
                      />
                      {formErrors.name && (
                        <p className="text-sm text-destructive">{formErrors.name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="seu@email.com"
                        className={formErrors.email ? 'border-destructive' : ''}
                      />
                      {formErrors.email && (
                        <p className="text-sm text-destructive">{formErrors.email}</p>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="password">Senha *</Label>
                        <Input
                          id="password"
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="Mínimo 6 caracteres"
                          className={formErrors.password ? 'border-destructive' : ''}
                        />
                        {formErrors.password && (
                          <p className="text-sm text-destructive">{formErrors.password}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          placeholder="Repita a senha"
                          className={formErrors.confirmPassword ? 'border-destructive' : ''}
                        />
                        {formErrors.confirmPassword && (
                          <p className="text-sm text-destructive">{formErrors.confirmPassword}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cpf">CPF (opcional)</Label>
                        <Input
                          id="cpf"
                          value={formData.cpf}
                          onChange={(e) => setFormData({ ...formData, cpf: formatCPF(e.target.value) })}
                          placeholder="000.000.000-00"
                          maxLength={14}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefone (opcional)</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            const formatted = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
                            setFormData({ ...formData, phone: formatted });
                          }}
                          placeholder="(00) 00000-0000"
                          maxLength={15}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-4">
                  <Button
                    onClick={() => setStep(1)}
                    variant="outline"
                    className="flex-1"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar
                  </Button>
                  <Button
                    onClick={handleContinueToPayment}
                    disabled={loading}
                    className="flex-1 h-14 text-lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        Ir para Pagamento Seguro
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Resumo */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resumo do Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedProducts.map((productId) => {
                    const product = getProductById(productId);
                    return (
                      <div key={productId} className="flex justify-between items-start pb-4 border-b">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{product?.name}</p>
                          {product?.isUpsell && (
                            <span className="text-xs text-primary">Upgrade</span>
                          )}
                        </div>
                        <p className="font-semibold">R$ {product?.price.toFixed(2)}</p>
                      </div>
                    );
                  })}

                  <div className="pt-4 space-y-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary">R$ {calculateTotal().toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground text-right">
                      Você economiza R$ {calculateSavings().toFixed(2)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-base">Depoimentos</CardTitle>
                </CardHeader>
                <CardContent>
                  <MiniTestimonials />
                </CardContent>
              </Card>

              <div className="text-center space-y-2">
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
