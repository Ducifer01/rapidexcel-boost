import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { initMercadoPago, Payment } from "@mercadopago/sdk-react";
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
import { Shield, Clock, Users, Star, Lock, Eye, CheckCircle2, Package, Gift, Loader2 } from "lucide-react";
import { PRODUCTS } from "@/lib/products";
import { z } from "zod";

// Inicializar Mercado Pago
const MP_PUBLIC_KEY = "APP_USR-55b50b66-c849-4bb4-9ea7-88bc3f3db1d0";
initMercadoPago(MP_PUBLIC_KEY, { locale: "pt-BR" });

const checkoutSchema = z
  .object({
    name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    email: z.string().email("Email inválido"),
    cpf: z.string().min(14, "CPF inválido"),
    password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
    confirmPassword: z.string().min(6, "Confirmação de senha obrigatória"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type CheckoutForm = z.infer<typeof checkoutSchema>;

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState<CheckoutForm>({
    name: "",
    email: "",
    cpf: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutForm, string>>>({});
  const [loading, setLoading] = useState(false);
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

  const handleInputChange = (field: keyof CheckoutForm, value: string) => {
    if (field === "cpf") {
      value = formatCPF(value);
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

  const onSubmit = async (paymentFormData: any) => {
    setLoading(true);

    try {
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
          description: "Por favor, corrija os erros no formulário.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (emailExists) {
        toast({
          title: "Email já cadastrado",
          description: "Faça login para comprar novos produtos.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Processar pagamento
      const { data, error } = await supabase.functions.invoke("process-payment", {
        body: {
          formData: paymentFormData,
          userData: {
            name: formData.name,
            email: formData.email,
            cpf: formData.cpf,
            password: formData.password,
            confirmPassword: formData.confirmPassword,
          },
          selectedProducts,
        },
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || "Erro ao processar pagamento");
      }

      // Salvar tokens de autenticação
      if (data.auth_tokens) {
        localStorage.setItem("sb-auth-token", JSON.stringify(data.auth_tokens));
      }

      // Redirecionar baseado no status do pagamento
      const payment = data.payment;

      if (payment.status === "approved") {
        toast({
          title: "Pagamento aprovado!",
          description: "Redirecionando para área de membros...",
        });
        setTimeout(() => navigate("/success"), 1000);
      } else if (payment.status === "pending") {
        toast({
          title: "Pagamento pendente",
          description: "Aguardando confirmação do pagamento...",
        });
        setTimeout(() => navigate("/pending"), 1000);
      } else if (payment.status === "rejected") {
        toast({
          title: "Pagamento recusado",
          description: payment.status_detail || "Tente outro método de pagamento.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Processando pagamento",
          description: "Aguarde a confirmação...",
        });
        setTimeout(() => navigate("/pending"), 2000);
      }
    } catch (error: any) {
      console.error("Erro no checkout:", error);
      toast({
        title: "Erro no pagamento",
        description: error.message || "Tente novamente ou entre em contato com o suporte.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onError = (error: any) => {
    console.error("Payment Brick error:", error);
    toast({
      title: "Erro no pagamento",
      description: "Verifique os dados e tente novamente.",
      variant: "destructive",
    });
  };

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
                      className={`flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedOption === "pack_1"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
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
                      className={`flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all relative ${
                        selectedOption === "both"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <Badge className="absolute -top-3 -right-3 bg-gradient-to-r from-primary to-primary-glow">
                        RECOMENDADO
                      </Badge>
                      <RadioGroupItem value="both" id="both" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">Pack Premium</h3>
                          <div className="text-right">
                            <span className="text-2xl font-bold text-primary">R$ 42,97</span>
                            <p className="text-xs text-muted-foreground line-through">R$ 1.997</p>
                          </div>
                        </div>
                        <div className="space-y-1 text-sm">
                          <p className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                            13.000 Planilhas Excel + 50 Dashboards
                          </p>
                          <p className="flex items-center gap-2">
                            <Gift className="w-4 h-4 text-primary" />
                            +2.000 Templates Word
                          </p>
                          <p className="flex items-center gap-2">
                            <Gift className="w-4 h-4 text-primary" />
                            +50.000 Slides PowerPoint
                          </p>
                          <p className="flex items-center gap-2">
                            <Gift className="w-4 h-4 text-primary" />
                            BÔNUS: 6.000 Planilhas Extras
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
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    disabled={loading}
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    disabled={loading}
                  />
                  {checkingEmail && <p className="text-sm text-muted-foreground">Verificando email...</p>}
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    placeholder="000.000.000-00"
                    value={formData.cpf}
                    onChange={(e) => handleInputChange("cpf", e.target.value)}
                    maxLength={14}
                    disabled={loading}
                  />
                  {errors.cpf && <p className="text-sm text-destructive">{errors.cpf}</p>}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      disabled={loading}
                    />
                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Repetir Senha</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Repita a senha"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      disabled={loading}
                    />
                    {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Brick */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Pagamento Seguro
                </CardTitle>
                <CardDescription>
                  💳 Cartão de Crédito até 2x | 💳 Débito | 🔵 PIX (aprovação instantânea)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <Payment
                    initialization={{
                      amount: totalAmount,
                      payer: {
                        email: formData.email || "",
                      },
                    }}
                    customization={{
                      paymentMethods: {
                        bankTransfer: ["pix"],
                        creditCard: "all",
                        debitCard: "all",
                        maxInstallments: 2,
                      },
                      visual: {
                        style: {
                          theme: "default",
                        },
                      },
                    }}
                    onSubmit={onSubmit}
                    onError={onError}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Order Summary */}
              <Card className="border-primary/20">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
                  <CardTitle>Resumo do Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  {selectedProducts.map((productId) => {
                    const product = PRODUCTS.find((p) => p.id === productId);
                    return (
                      <div key={productId} className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{product?.name}</p>
                        </div>
                        <p className="font-bold text-primary">R$ {product?.price.toFixed(2)}</p>
                      </div>
                    );
                  })}

                  <Separator />

                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">TOTAL:</span>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">R$ {totalAmount.toFixed(2)}</p>
                      {selectedOption === "both" && (
                        <p className="text-xs text-muted-foreground line-through">R$ 1.997</p>
                      )}
                    </div>
                  </div>

                  {selectedOption === "both" && (
                    <div className="bg-primary/10 p-3 rounded-lg space-y-2">
                      <p className="font-semibold text-sm flex items-center gap-2">
                        <Gift className="w-4 h-4" />
                        BÔNUS INCLUSOS:
                      </p>
                      <ul className="text-xs space-y-1 ml-6">
                        <li>✓ 6.000 Planilhas Excel Extras</li>
                        <li>✓ Templates de Contratos</li>
                        <li>✓ Guia "Como Conquistar Clientes"</li>
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Guarantee */}
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Shield className="w-6 h-6 text-primary" />
                    <h3 className="font-bold">Garantia Incondicional</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    7 dias para testar. Se não gostar, devolvemos 100% do seu dinheiro. Sem perguntas, sem burocracia.
                  </p>
                </CardContent>
              </Card>

              {/* Social Proof */}
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      <span className="font-semibold text-sm">Clientes Satisfeitos</span>
                    </div>
                    <span className="font-bold text-primary">{buyersCount.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                    <span className="ml-2 text-sm font-semibold">4.9/5.0</span>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    {miniTestimonials.slice(0, 2).map((testimonial, idx) => (
                      <div key={idx} className="text-xs">
                        <p className="italic text-muted-foreground">"{testimonial.text}"</p>
                        <p className="font-semibold mt-1">
                          - {testimonial.name}, {testimonial.role}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Security Badges */}
              <Card>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Lock className="w-4 h-4 text-primary" />
                    <span className="font-semibold">Pagamento 100% Seguro</span>
                  </div>
                  <p className="text-xs text-muted-foreground">SSL 256-bit | Dados Protegidos | Mercado Pago</p>
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
