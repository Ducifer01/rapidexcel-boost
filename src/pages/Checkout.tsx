import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { formatCPF } from "@/lib/cpf-utils";
import { useToast } from "@/hooks/use-toast";
import { Shield, Clock, Users, Star, Lock, Eye, CheckCircle2, Package, Loader2 } from "lucide-react";
import { PRODUCTS } from "@/lib/products";
import { z } from "zod";
import { cn } from "@/lib/utils";

// Declaração global do MercadoPago
declare global {
  interface Window {
    MercadoPago: any;
    paymentBrickController: any;
  }
}

const checkoutSchema = z
  .object({
    name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    email: z.string().email("Email inválido"),
    phone: z.string().min(14, "Telefone inválido"),
    cpf: z.string().min(14, "CPF inválido"),
    password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
    confirmPassword: z.string().min(6, "Confirme sua senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type CheckoutForm = z.infer<typeof checkoutSchema>;

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Mercado Pago SDK loading
  const [mpLoaded, setMpLoaded] = useState(false);
  const [mpPublicKey, setMpPublicKey] = useState<string | null>(null);
  const brickContainerRef = useRef<HTMLDivElement>(null);

  // Form state
  const [formData, setFormData] = useState<CheckoutForm>({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutForm, string>>>({});
  const [emailExists, setEmailExists] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);

  // Product selection
  const [selectedOption, setSelectedOption] = useState<"pack_1" | "both">("both");
  const selectedProducts = selectedOption === "both" ? ["pack_1", "pack_2"] : ["pack_1"];
  const totalAmount = selectedProducts.reduce((sum, id) => {
    const product = PRODUCTS.find((p) => p.id === id);
    return sum + (product?.price || 0);
  }, 0);

  // Social proof & conversion elements
  const [buyersCount, setBuyersCount] = useState(2847);
  const [viewCount, setViewCount] = useState(47);
  const [timeLeft, setTimeLeft] = useState(15 * 60);

  // Testimonials
  const miniTestimonials = [
    { name: "João Silva", role: "Empresário", text: "Economizei horas de trabalho!" },
    { name: "Maria Costa", role: "Freelancer", text: "Melhor investimento que fiz!" },
    { name: "Pedro Santos", role: "Estudante", text: "Perfeito para meus projetos!" },
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Load Mercado Pago SDK
  useEffect(() => {
    const loadMercadoPagoSDK = async () => {
      try {
        // Fetch public key
        console.log('🔑 Buscando chave pública...');
        const { data, error } = await supabase.functions.invoke('get-public-key');
        
        if (error || !data?.public_key) {
          console.error('❌ Erro ao buscar chave pública:', error);
          toast({
            title: "Erro ao carregar pagamento",
            description: "Tente recarregar a página.",
            variant: "destructive",
          });
          return;
        }

        console.log('✅ Chave pública carregada');
        setMpPublicKey(data.public_key);

        // Load SDK script
        if (!document.getElementById('mercadopago-sdk')) {
          const script = document.createElement('script');
          script.id = 'mercadopago-sdk';
          script.src = 'https://sdk.mercadopago.com/js/v2';
          script.async = true;
          script.onload = () => {
            console.log('✅ SDK Mercado Pago carregado');
            setMpLoaded(true);
          };
          script.onerror = () => {
            console.error('❌ Erro ao carregar SDK');
            toast({
              title: "Erro ao carregar SDK de pagamento",
              description: "Recarregue a página.",
              variant: "destructive",
            });
          };
          document.body.appendChild(script);
        } else {
          setMpLoaded(true);
        }
      } catch (error) {
        console.error('❌ Erro fatal:', error);
      }
    };

    loadMercadoPagoSDK();
  }, [toast]);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // View counter animation
  useEffect(() => {
    const interval = setInterval(() => {
      setViewCount((prev) => prev + Math.floor(Math.random() * 3) - 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Buyers count animation
  useEffect(() => {
    const interval = setInterval(() => {
      setBuyersCount((prev) => prev + 1);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return `+55 ${numbers}`;
    if (numbers.length <= 7) return `+55 (${numbers.slice(2, 4)}) ${numbers.slice(4)}`;
    return `+55 (${numbers.slice(2, 4)}) ${numbers.slice(4, 9)}-${numbers.slice(9, 13)}`;
  };

  const handleInputChange = (field: keyof CheckoutForm, value: string) => {
    if (field === "cpf") {
      value = formatCPF(value);
    } else if (field === "phone") {
      value = formatPhone(value);
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Check if email exists
  useEffect(() => {
    const checkEmail = async () => {
      if (!formData.email || !formData.email.includes("@")) return;

      setCheckingEmail(true);
      try {
        const { data, error } = await supabase.functions.invoke("check-email-status", {
          body: { email: formData.email },
        });

        if (!error && data) {
          setEmailExists(data.exists);
          if (data.exists) {
            setErrors((prev) => ({
              ...prev,
              email: "Email já cadastrado. Faça login para comprar.",
            }));
          }
        }
      } catch (error) {
        console.error("Erro ao verificar email:", error);
      } finally {
        setCheckingEmail(false);
      }
    };

    const timeoutId = setTimeout(checkEmail, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.email]);

  // Render Payment Brick quando SDK e dados estiverem prontos
  useEffect(() => {
    if (!mpLoaded || !mpPublicKey || !brickContainerRef.current) return;
    if (!formData.email || !formData.name || formData.cpf.length < 14) return;
    if (errors.email || errors.cpf || emailExists) return;

    // Destruir brick anterior se existir
    if (window.paymentBrickController) {
      window.paymentBrickController.unmount();
    }

    const renderPaymentBrick = async () => {
      try {
        console.log('🎨 Renderizando Payment Brick...');
        
        const mp = new window.MercadoPago(mpPublicKey, {
          locale: 'pt-BR'
        });

        const bricksBuilder = mp.bricks();

        const settings = {
          initialization: {
            amount: totalAmount,
            payer: {
              firstName: formData.name.split(' ')[0] || '',
              lastName: formData.name.split(' ').slice(1).join(' ') || '',
              email: formData.email,
            },
          },
          customization: {
            visual: {
              style: {
                theme: 'default',
              },
            },
            paymentMethods: {
              creditCard: 'all',
              bankTransfer: 'all',
              maxInstallments: 2,
            },
          },
          callbacks: {
            onReady: () => {
              console.log('✅ Payment Brick pronto');
            },
            onSubmit: ({ selectedPaymentMethod, formData: paymentFormData }: any) => {
              console.log('🚀 Processando pagamento...');
              console.log('📦 Método:', selectedPaymentMethod);
              
              return new Promise((resolve, reject) => {
                // Validar formulário
                const validation = checkoutSchema.safeParse(formData);
                if (!validation.success) {
                  const newErrors: Partial<Record<keyof CheckoutForm, string>> = {};
                  validation.error.errors.forEach((err) => {
                    if (err.path[0]) {
                      newErrors[err.path[0] as keyof CheckoutForm] = err.message;
                    }
                  });
                  setErrors(newErrors);
                  toast({
                    title: "Dados inválidos",
                    description: "Corrija os erros no formulário.",
                    variant: "destructive",
                  });
                  reject(new Error("Formulário inválido"));
                  return;
                }

                if (emailExists) {
                  toast({
                    title: "Email já cadastrado",
                    description: "Faça login para comprar.",
                    variant: "destructive",
                  });
                  reject(new Error("Email já cadastrado"));
                  return;
                }

                // Processar pagamento
                supabase.functions.invoke("process-payment", {
                  body: {
                    formData: paymentFormData,
                    userData: {
                      name: formData.name,
                      email: formData.email,
                      cpf: formData.cpf,
                      phone: formData.phone,
                      password: formData.password,
                    },
                    selectedProducts,
                  },
                })
                .then(({ data, error }) => {
                  if (error) {
                    console.error('❌ Erro:', error);
                    toast({
                      title: "Erro no pagamento",
                      description: error.message || "Tente novamente.",
                      variant: "destructive",
                    });
                    reject(error);
                    return;
                  }

                  if (!data.success) {
                    toast({
                      title: "Erro no pagamento",
                      description: data.error || "Tente novamente.",
                      variant: "destructive",
                    });
                    reject(new Error(data.error));
                    return;
                  }

                  console.log('✅ Pagamento processado:', data.payment.status);

                  // Salvar tokens
                  if (data.auth_tokens) {
                    localStorage.setItem("sb-auth-token", JSON.stringify(data.auth_tokens));
                  }

                  resolve(data);

                  // Redirecionar
                  const payment = data.payment;
                  if (payment.status === "approved") {
                    toast({
                      title: "Pagamento aprovado!",
                      description: "Redirecionando...",
                    });
                    setTimeout(() => navigate("/success"), 1000);
                  } else if (payment.status === "pending") {
                    toast({
                      title: "Pagamento pendente",
                      description: "Aguardando confirmação...",
                    });
                    setTimeout(() => navigate("/pending"), 1000);
                  } else if (payment.status === "rejected") {
                    toast({
                      title: "Pagamento recusado",
                      description: payment.status_detail || "Tente outro método.",
                      variant: "destructive",
                    });
                  } else {
                    setTimeout(() => navigate("/pending"), 2000);
                  }
                })
                .catch((error) => {
                  console.error('❌ Erro fatal:', error);
                  toast({
                    title: "Erro no pagamento",
                    description: "Tente novamente.",
                    variant: "destructive",
                  });
                  reject(error);
                });
              });
            },
            onError: (error: any) => {
              console.error('❌ Payment Brick error:', error);
              toast({
                title: "Erro no pagamento",
                description: "Verifique os dados.",
                variant: "destructive",
              });
            },
          },
        };

        window.paymentBrickController = await bricksBuilder.create(
          'payment',
          'paymentBrick_container',
          settings
        );

        console.log('✅ Payment Brick renderizado');
      } catch (error) {
        console.error('❌ Erro ao renderizar brick:', error);
        toast({
          title: "Erro ao carregar pagamento",
          description: "Recarregue a página.",
          variant: "destructive",
        });
      }
    };

    renderPaymentBrick();

    return () => {
      if (window.paymentBrickController) {
        window.paymentBrickController.unmount();
      }
    };
  }, [mpLoaded, mpPublicKey, formData.email, formData.name, formData.cpf, totalAmount, errors.email, errors.cpf, emailExists, selectedProducts, navigate, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header with Timer */}
      <div className="bg-gradient-to-r from-primary via-primary-glow to-primary text-primary-foreground py-4 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              <span className="font-semibold text-sm md:text-base">🔒 Checkout 100% Seguro</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
              <Clock className="w-5 h-5" />
              <span className="font-bold text-lg">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* Main Content - Form + Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* View Counter */}
            <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Eye className="w-4 h-4 text-primary" />
                    <span className="animate-pulse">
                      <span className="font-bold text-primary">{viewCount}</span> pessoas visualizando agora
                    </span>
                  </div>
                  <Badge className="bg-gradient-to-r from-primary to-primary-glow">93% OFF</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Product Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Escolha seu Pack
                </CardTitle>
                <CardDescription>Selecione a melhor opção para você</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedOption} onValueChange={(value: any) => setSelectedOption(value)}>
                  <div className="space-y-4">
                    {/* Pack 1 Only */}
                    <label
                      className={cn(
                        "flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all",
                        selectedOption === "pack_1"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <RadioGroupItem value="pack_1" id="pack_1" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">Pack Excel Completo Pro</h3>
                          <span className="text-2xl font-bold text-primary">R$ 12,99</span>
                        </div>
                        <p className="text-sm text-muted-foreground">13.000 planilhas Excel + 50 dashboards premium</p>
                      </div>
                    </label>

                    {/* Both Packs - RECOMMENDED */}
                    <label
                      className={cn(
                        "flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all relative",
                        selectedOption === "both"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <Badge className="absolute -top-3 -right-3 bg-gradient-to-r from-primary to-primary-glow">
                        RECOMENDADO
                      </Badge>
                      <RadioGroupItem value="both" id="both" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">Pack Premium Completo</h3>
                          <div className="text-right">
                            <span className="text-2xl font-bold text-primary">R$ 42,97</span>
                            <p className="text-xs text-muted-foreground line-through">R$ 1.997</p>
                          </div>
                        </div>
                        <div className="space-y-1 text-sm">
                          <p className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                            Tudo do Pack 1 + Pack 2 Office Premium
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* User Data Form */}
            <Card>
              <CardHeader>
                <CardTitle>Seus Dados</CardTitle>
                <CardDescription>Preencha para criar sua conta e acessar os produtos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    placeholder="Seu nome completo"
                    className="h-12 text-lg"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    className="h-12 text-lg"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                  {checkingEmail && <p className="text-sm text-muted-foreground">Verificando email...</p>}
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    placeholder="+55 (00) 00000-0000"
                    className="h-12 text-lg"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    maxLength={20}
                  />
                  {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    placeholder="000.000.000-00"
                    className="h-12 text-lg"
                    value={formData.cpf}
                    onChange={(e) => handleInputChange("cpf", e.target.value)}
                    maxLength={14}
                  />
                  {errors.cpf && <p className="text-sm text-destructive">{errors.cpf}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    className="h-12 text-lg"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                  />
                  {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Digite sua senha novamente"
                    className="h-12 text-lg"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  />
                  {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
                </div>
              </CardContent>
            </Card>

            {/* Payment Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" />
                  Pagamento Seguro
                </CardTitle>
                <CardDescription>
                  PIX ou Cartão de Crédito (até 2x sem juros)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!mpLoaded || !mpPublicKey ? (
                  <div className="py-12 text-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                    <p className="text-sm text-muted-foreground">Carregando meio de pagamento...</p>
                  </div>
                ) : !formData.email || !formData.name || formData.cpf.length < 14 ? (
                  <div className="py-12 text-center space-y-4">
                    <Lock className="w-16 h-16 mx-auto text-muted-foreground opacity-50" />
                    <div>
                      <p className="font-medium text-muted-foreground">
                        Complete seus dados acima
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Nome, Email e CPF são obrigatórios
                      </p>
                    </div>
                  </div>
                ) : (
                  <div 
                    id="paymentBrick_container" 
                    ref={brickContainerRef}
                    style={{ minHeight: 300 }}
                    className="w-full"
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Resumo do Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {selectedProducts.map((productId) => {
                      const product = PRODUCTS.find((p) => p.id === productId);
                      return (
                        <div key={productId} className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{product?.name}</p>
                            <p className="text-xs text-muted-foreground">{product?.description}</p>
                          </div>
                          <p className="font-bold">R$ {product?.price.toFixed(2)}</p>
                        </div>
                      );
                    })}
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">Total:</span>
                    <span className="text-2xl font-bold text-primary">R$ {totalAmount.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-center text-muted-foreground">
                    ou 2x de R$ {(totalAmount / 2).toFixed(2)} sem juros
                  </p>
                </CardContent>
              </Card>

              {/* Trust Badges */}
              <Card className="bg-gradient-to-br from-primary/5 to-transparent">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <Shield className="w-6 h-6 text-primary" />
                    <div>
                      <p className="font-bold text-sm">🛡️ Garantia de 7 dias</p>
                      <p className="text-xs text-muted-foreground">100% do seu dinheiro de volta</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Lock className="w-6 h-6 text-primary" />
                    <div>
                      <p className="font-bold text-sm">🔒 Pagamento Seguro</p>
                      <p className="text-xs text-muted-foreground">Seus dados protegidos</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="w-6 h-6 text-primary" />
                    <div>
                      <p className="font-bold text-sm">👥 {buyersCount.toLocaleString('pt-BR')}+ compradores</p>
                      <p className="text-xs text-muted-foreground">Compraram este pack</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Mini Testimonials */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Star className="w-5 h-5 text-primary fill-primary" />
                    Avaliações Recentes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {miniTestimonials.map((testimonial, idx) => (
                    <div key={idx} className="text-sm">
                      <p className="font-medium">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                      <p className="text-xs italic mt-1">"{testimonial.text}"</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
