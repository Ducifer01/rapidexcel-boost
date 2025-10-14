import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Shield, Clock, Users, Star } from "lucide-react";
import { formatCPF } from "@/lib/cpf-utils";
import { PRODUCTS } from "@/lib/products";

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // MP initialization
  const [mpReady, setMpReady] = useState(false);
  const [mpPublicKey, setMpPublicKey] = useState("");
  
  // Payment data
  const [preferenceId, setPreferenceId] = useState("");
  const [externalReference, setExternalReference] = useState("");
  const [amount, setAmount] = useState(0);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    password: "",
    confirmPassword: ""
  });
  
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [emailExists, setEmailExists] = useState(false);

  // Social proof
  const [viewCount, setViewCount] = useState(127);
  const [timeLeft, setTimeLeft] = useState(15 * 60);

  // Initialize Mercado Pago
  useEffect(() => {
    const initMP = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-public-key');
        
        if (error) throw error;
        if (!data?.public_key) throw new Error('Public key não retornada');
        
        setMpPublicKey(data.public_key);
        initMercadoPago(data.public_key, { locale: 'pt-BR' });
        setMpReady(true);
      } catch (error) {
        console.error('Erro ao inicializar MP:', error);
      }
    };
    
    initMP();
  }, []);

  // Check if coming from Index with pre-selected products
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const productsParam = params.get('products');
    if (productsParam) {
      const products = productsParam.split(',');
      setSelectedProducts(products);
    }
  }, [location.search]);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Animate view count
  useEffect(() => {
    const interval = setInterval(() => {
      setViewCount((prev) => prev + Math.floor(Math.random() * 3));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Check email existence
  useEffect(() => {
    const checkEmail = async () => {
      if (formData.email && formData.email.includes('@')) {
        const { data } = await supabase
          .from('users')
          .select('email')
          .eq('email', formData.email)
          .maybeSingle();
        
        setEmailExists(!!data);
      }
    };
    
    const timeoutId = setTimeout(checkEmail, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.email]);

  // Create preference when form is ready
  useEffect(() => {
    const createPreference = async () => {
      if (!formData.name || !formData.email || !formData.password || selectedProducts.length === 0) {
        return;
      }
      
      if (emailExists) {
        setErrors(prev => ({ ...prev, email: 'Este email já está cadastrado. Faça login.' }));
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setErrors(prev => ({ ...prev, confirmPassword: 'As senhas não coincidem' }));
        return;
      }

      try {
        setLoading(true);
        
        // Calculate amount
        const totalAmount = selectedProducts.reduce((sum, productId) => {
          const product = PRODUCTS.find(p => p.id === productId);
          return sum + (product?.price || 0);
        }, 0);
        
        setAmount(totalAmount);

        // Call create-payment
        const { data, error } = await supabase.functions.invoke('create-payment', {
          body: {
            product_ids: selectedProducts,
            payer: {
              name: formData.name,
              email: formData.email,
            },
            password: formData.password,
          }
        });

        if (error) throw error;
        
        setPreferenceId(data.preference_id);
        setExternalReference(data.external_reference);
      } catch (error) {
        console.error('Erro ao criar preferência:', error);
      } finally {
        setLoading(false);
      }
    };

    createPreference();
  }, [formData.name, formData.email, formData.password, formData.confirmPassword, selectedProducts, emailExists]);

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value;
    
    if (field === 'cpf') {
      formattedValue = formatCPF(value);
    } else if (field === 'phone') {
      formattedValue = value.replace(/\D/g, '').slice(0, 11);
    }
    
    setFormData(prev => ({ ...prev, [field]: formattedValue }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleProductSelection = (productId: string) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      }
      return [...prev, productId];
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const onSubmit = async ({ selectedPaymentMethod, formData: brickFormData }: any) => {
    return new Promise((resolve, reject) => {
      supabase.functions.invoke('process-payment', {
        body: {
          ...brickFormData,
          external_reference: externalReference,
        }
      })
      .then(({ data, error }) => {
        if (error) {
          console.error('Erro ao processar pagamento:', error);
          return reject(error);
        }
        
        const status = data?.payment?.status || data?.status;
        
        if (status === 'approved') {
          navigate('/success');
        } else if (status === 'pending' || status === 'in_process') {
          navigate('/pending');
        } else {
          navigate('/failure');
        }
        
        resolve(data);
      })
      .catch(err => {
        console.error('Erro na chamada:', err);
        reject(err);
      });
    });
  };

  const onReady = () => {
    console.log('Payment Brick está pronto');
  };

  const onError = (error: any) => {
    console.error('Erro no Payment Brick:', error);
  };

  const [firstName, lastName] = formData.name.split(' ');

  const initialization = {
    amount,
    preferenceId,
    payer: {
      firstName: firstName || '',
      lastName: lastName || '',
      email: formData.email,
    }
  };

  const customization = {
    paymentMethods: {
      ticket: 'all' as const,
      bankTransfer: 'all' as const,
      creditCard: 'all' as const,
      debitCard: 'all' as const,
      mercadoPago: 'all' as const,
      maxInstallments: 1,
    },
    visual: {
      style: {
        theme: 'default' as const,
      }
    }
  };

  const canRenderBrick = mpReady && preferenceId && amount > 0 && formData.name && formData.email;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Checkout Seguro</span>
            </div>
            {timeLeft > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-medium">Oferta expira em: {formatTime(timeLeft)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* View Counter */}
            <Card className="border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-primary" />
                  <span><strong>{viewCount}</strong> pessoas estão visualizando esta oferta agora</span>
                </div>
              </CardContent>
            </Card>

            {/* Product Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Escolha seu Pacote</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedProducts[0] || ""} onValueChange={(value) => setSelectedProducts([value])}>
                  <div className="space-y-3">
                    {PRODUCTS.map((product) => (
                      <div key={product.id} className="flex items-center space-x-3 p-4 border rounded-lg hover:border-primary transition-colors">
                        <RadioGroupItem value={product.id} id={product.id} />
                        <Label htmlFor={product.id} className="flex-1 cursor-pointer">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold">{product.name}</p>
                              <p className="text-sm text-muted-foreground">{product.description}</p>
                            </div>
                            <p className="text-lg font-bold text-primary">
                              R$ {product.price.toFixed(2)}
                            </p>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* User Data Form */}
            <Card>
              <CardHeader>
                <CardTitle>Seus Dados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Seu nome completo"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="seu@email.com"
                  />
                  {emailExists && (
                    <p className="text-sm text-destructive mt-1">Este email já está cadastrado</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="(00) 00000-0000"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      value={formData.cpf}
                      onChange={(e) => handleInputChange('cpf', e.target.value)}
                      placeholder="000.000.000-00"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Crie uma senha"
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Confirme sua senha"
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Payment Section */}
            <Card>
              <CardHeader>
                <CardTitle>Pagamento</CardTitle>
              </CardHeader>
              <CardContent>
                {!mpReady && (
                  <div className="py-8 text-center text-muted-foreground">
                    Carregando Mercado Pago...
                  </div>
                )}
                
                {mpReady && !canRenderBrick && (
                  <div className="py-8 text-center text-muted-foreground">
                    Preencha todos os dados acima para continuar
                  </div>
                )}
                
                {canRenderBrick && (
                  <div className="min-h-[300px] w-full">
                    <Payment
                      initialization={initialization}
                      customization={customization}
                      onSubmit={onSubmit}
                      onReady={onReady}
                      onError={onError}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedProducts.map(productId => {
                  const product = PRODUCTS.find(p => p.id === productId);
                  if (!product) return null;
                  return (
                    <div key={product.id} className="flex justify-between">
                      <span>{product.name}</span>
                      <span className="font-semibold">R$ {product.price.toFixed(2)}</span>
                    </div>
                  );
                })}
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">R$ {amount.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trust Badges */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold">Compra 100% Segura</p>
                    <p className="text-sm text-muted-foreground">Seus dados estão protegidos</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Star className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold">Satisfação Garantida</p>
                    <p className="text-sm text-muted-foreground">7 dias de garantia</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mini Testimonials */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">O que nossos clientes dizem</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-sm">"Excelente produto, super recomendo!"</p>
                  <p className="text-xs text-muted-foreground">- Maria Silva</p>
                </div>
                <div className="space-y-2">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-sm">"Valeu muito a pena, entrega rápida."</p>
                  <p className="text-xs text-muted-foreground">- João Santos</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
