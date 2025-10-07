import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Clock, Check, Lock, Users, TrendingUp, Sparkles, Star, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { formatCPF, validateCPF } from "@/lib/cpf-utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const checkoutSchema = z.object({
  name: z.string().trim().min(3, "Nome deve ter pelo menos 3 caracteres").max(100),
  email: z.string().trim().email("E-mail inválido").max(255),
  cpf: z.string().trim().refine((val) => validateCPF(val.replace(/\D/g, '')), {
    message: "CPF inválido",
  }),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").max(50),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({ name: '', email: '', cpf: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [hasUpsell, setHasUpsell] = useState(false);
  const [buyersCount, setBuyersCount] = useState(2847);
  const [showNotification, setShowNotification] = useState(false);
  const [currentNotification, setCurrentNotification] = useState({ name: "Maria Silva", city: "São Paulo" });
  const [timeLeft, setTimeLeft] = useState(14 * 60 + 43);
  const [showUpsellModal, setShowUpsellModal] = useState(false);

  const pack1Price = 12.99;
  const pack2Price = 12.99;
  const totalPrice = hasUpsell ? pack1Price + pack2Price : pack1Price;

  const pack1Name = "Planilhas 6k Pro";
  const pack2Name = "Dashboards+Bônus";
  const pack1OriginalPrice = 197.00;
  const pack2OriginalPrice = 25.00;

  const notifications = [
    { name: "Maria Silva", city: "São Paulo" },
    { name: "João Santos", city: "Rio de Janeiro" },
    { name: "Ana Costa", city: "Belo Horizonte" },
    { name: "Pedro Oliveira", city: "Salvador" },
    { name: "Carla Ferreira", city: "Brasília" },
  ];

  // Efeitos para prova social
  useEffect(() => {
    const buyersInterval = setInterval(() => {
      setBuyersCount(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, Math.random() * 15000 + 10000);

    const notificationInterval = setInterval(() => {
      const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
      setCurrentNotification(randomNotification);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 4000);
    }, Math.random() * 20000 + 15000);

    return () => {
      clearInterval(buyersInterval);
      clearInterval(notificationInterval);
    };
  }, []);

  // Cronômetro
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Scroll to top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (field: string, value: string) => {
    let processedValue = value;
    if (field === 'cpf') {
      processedValue = formatCPF(value);
    }
    setFormData(prev => ({ ...prev, [field]: processedValue }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Se não tem upsell, mostrar modal de confirmação
    if (!hasUpsell) {
      setShowUpsellModal(true);
      return;
    }
    
    await processPayment();
  };

  const processPayment = async () => {
    setErrors({});
    setLoading(true);

    const result = checkoutSchema.safeParse(formData);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) newErrors[err.path[0] as string] = err.message;
      });
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const productIds = hasUpsell ? ['pack_1', 'pack_2'] : ['pack_1'];

      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          product_ids: productIds,
          payer: {
            email: formData.email,
            name: formData.name,
            identification: {
              type: 'CPF',
              number: formData.cpf.replace(/\D/g, ''),
            },
          },
          password: formData.password,
          back_urls: {
            success: `${window.location.origin}/success`,
            failure: `${window.location.origin}/failure`,
            pending: `${window.location.origin}/pending`,
          },
        },
      });

      if (error) throw error;
      
      // Salvar tokens de autenticação se disponíveis
      if (data?.auth_tokens) {
        localStorage.setItem('sb-access-token', data.auth_tokens.access_token);
        localStorage.setItem('sb-refresh-token', data.auth_tokens.refresh_token);
      }
      
      if (data?.init_point) {
        window.location.href = data.init_point;
      } else {
        throw new Error('URL de pagamento não recebida');
      }
    } catch (error) {
      console.error('Erro no checkout:', error);
      toast({
        title: "Erro ao processar pagamento",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-6 px-4">
      {/* Notificação */}
      {showNotification && (
        <div className="fixed bottom-6 left-6 z-50 animate-in slide-in-from-left duration-500">
          <Card className="border-2 border-primary bg-card shadow-2xl max-w-xs">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="text-2xl">🎉</div>
              <div className="text-sm">
                <p className="font-bold text-foreground">{currentNotification.name}</p>
                <p className="text-muted-foreground">de {currentNotification.city}</p>
                <p className="text-primary font-semibold">acabou de comprar!</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Container Principal */}
      <div className="w-full max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge className="mb-4 bg-gradient-to-r from-primary to-primary-glow text-white px-4 py-2 text-sm shadow-lg animate-pulse">
            <Shield className="w-4 h-4 mr-2 inline" />
            CHECKOUT 100% SEGURO
          </Badge>
          
          <h1 className="text-3xl md:text-5xl font-black mb-3 text-foreground">
            Finalize Sua Compra
          </h1>
          
          <p className="text-base md:text-lg text-muted-foreground mb-6">
            <Clock className="w-4 h-4 inline mr-1" />
            Acesso <span className="text-primary font-bold">imediato</span> após confirmação
          </p>
          
          {/* Timer */}
          <div className="inline-flex flex-col sm:flex-row items-center gap-2 bg-gradient-to-r from-destructive/20 via-orange-500/20 to-destructive/20 border-2 border-destructive/50 rounded-xl px-4 py-3 shadow-lg animate-pulse">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-destructive flex-shrink-0" />
              <span className="text-sm font-semibold text-foreground whitespace-nowrap">
                Oferta termina em:
              </span>
            </div>
            <span className="text-3xl font-black text-destructive tabular-nums whitespace-nowrap">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {/* Conteúdo - Mobile First */}
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-start">
          
          {/* Coluna Formulário - Mobile First */}
          <div className="w-full lg:flex-1">
            
            {/* Card Formulário */}
            <Card className="border-2 border-border/50 shadow-xl bg-card/90 backdrop-blur mb-6">
              <CardHeader className="border-b border-border/50 bg-gradient-to-br from-primary/5 to-transparent p-4 md:p-6">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <CardTitle className="flex items-center gap-2 text-lg md:text-2xl">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Lock className="w-5 h-5 text-primary" />
                    </div>
                    Seus Dados
                  </CardTitle>
                </div>
              </CardHeader>
              
              <CardContent className="p-4 md:p-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  
                  {/* Nome */}
                  <div>
                    <Label htmlFor="name" className="text-sm md:text-base font-semibold mb-2 block">
                      Nome Completo *
                    </Label>
                    <Input
                      id="name"
                      placeholder="Como está no seu documento"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`h-12 ${errors.name ? "border-destructive" : ""}`}
                      disabled={loading}
                    />
                    {errors.name && (
                      <p className="text-xs md:text-sm text-destructive mt-2 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 flex-shrink-0" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <Label htmlFor="email" className="text-sm md:text-base font-semibold mb-2 block">
                      E-mail *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`h-12 ${errors.email ? "border-destructive" : ""}`}
                      disabled={loading}
                    />
                    {errors.email && (
                      <p className="text-xs md:text-sm text-destructive mt-2 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 flex-shrink-0" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* CPF */}
                  <div>
                    <Label htmlFor="cpf" className="text-sm md:text-base font-semibold mb-2 block">
                      CPF *
                    </Label>
                    <Input
                      id="cpf"
                      placeholder="000.000.000-00"
                      value={formData.cpf}
                      onChange={(e) => handleInputChange('cpf', e.target.value)}
                      maxLength={14}
                      className={`h-12 ${errors.cpf ? "border-destructive" : ""}`}
                      disabled={loading}
                    />
                    {errors.cpf && (
                      <p className="text-xs md:text-sm text-destructive mt-2 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 flex-shrink-0" />
                        {errors.cpf}
                      </p>
                    )}
                  </div>

                  {/* Senha */}
                  <div>
                    <Label htmlFor="password" className="text-sm md:text-base font-semibold mb-2 block">
                      Senha *
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`h-12 ${errors.password ? "border-destructive" : ""}`}
                      disabled={loading}
                    />
                    {errors.password && (
                      <p className="text-xs md:text-sm text-destructive mt-2 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 flex-shrink-0" />
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Repetir Senha */}
                  <div>
                    <Label htmlFor="confirmPassword" className="text-sm md:text-base font-semibold mb-2 block">
                      Repetir Senha *
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Digite a senha novamente"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className={`h-12 ${errors.confirmPassword ? "border-destructive" : formData.confirmPassword && formData.password === formData.confirmPassword ? "border-green-500" : ""}`}
                      disabled={loading}
                    />
                    {errors.confirmPassword && (
                      <p className="text-xs md:text-sm text-destructive mt-2 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 flex-shrink-0" />
                        {errors.confirmPassword}
                      </p>
                    )}
                    {!errors.confirmPassword && formData.confirmPassword && formData.password === formData.confirmPassword && (
                      <p className="text-xs md:text-sm text-green-600 mt-2 flex items-center gap-1">
                        <Check className="w-3 h-3 flex-shrink-0" />
                        Senhas coincidem
                      </p>
                    )}
                    <div className="mt-3 p-3 bg-primary/10 border border-primary/30 rounded-lg">
                      <p className="text-xs text-primary font-medium flex items-start gap-2">
                        <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>
                          Essas credenciais serão usadas para acessar suas planilhas após o pagamento.
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Botão de Finalizar */}
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-14 text-lg font-bold bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary shadow-lg transition-all"
                    disabled={loading}
                  >
                    {loading ? "Processando..." : "Ir para Pagamento Seguro"}
                  </Button>

                  {/* Segurança */}
                  <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-xs md:text-sm text-muted-foreground pt-2">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0" />
                      <span>Pagamento Seguro</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0" />
                      <span>SSL Criptografado</span>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>


            {/* Card Upsell */}
            <Card className="border-2 border-primary/50 shadow-xl bg-gradient-to-br from-primary/10 via-background to-background mb-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-to-br from-primary to-primary-glow text-white px-4 py-1 rounded-bl-xl font-bold text-sm shadow-lg">
                OFERTA ESPECIAL
              </div>
              
              <CardHeader className="p-4 md:p-6 pt-12 border-b border-border/50">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                    <CardTitle className="text-lg md:text-2xl">
                      Adicione {pack2Name}
                    </CardTitle>
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    + Planner Financeiro Premium + 50 Dashboards Profissionais
                  </p>
                </div>
              </CardHeader>
              
              <CardContent className="p-4 md:p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-sm md:text-base">Planner Financeiro Anual</p>
                      <p className="text-xs text-muted-foreground">Controle total das suas finanças</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-sm md:text-base">50 Dashboards Profissionais</p>
                      <p className="text-xs text-muted-foreground">Visualizações e análises poderosas</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-sm md:text-base">Templates Exclusivos</p>
                      <p className="text-xs text-muted-foreground">Designs únicos e personalizáveis</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs text-muted-foreground line-through">
                        De R$ {pack2OriginalPrice.toFixed(2)}
                      </p>
                      <p className="text-2xl md:text-3xl font-black text-primary">
                        por R$ {pack2Price.toFixed(2)}
                      </p>
                      <p className="text-xs text-primary font-semibold">
                        93% de desconto • Hoje apenas!
                      </p>
                    </div>
                    <Badge className="bg-gradient-to-r from-destructive to-orange-500 text-white px-3 py-1 text-xs md:text-sm font-bold shadow-lg">
                      -93%
                    </Badge>
                  </div>
                  
                  <Button
                    onClick={() => setHasUpsell(!hasUpsell)}
                    variant={hasUpsell ? "default" : "outline"}
                    className={`w-full h-12 font-bold text-sm md:text-base transition-all ${
                      hasUpsell
                        ? 'bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary'
                        : 'hover:bg-primary/10'
                    }`}
                  >
                    {hasUpsell ? (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        Adicionado ao Pedido
                      </>
                    ) : (
                      'Adicionar ao Pedido'
                    )}
                  </Button>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span>89% dos clientes adicionaram este pacote</span>
                </div>
              </CardContent>
            </Card>

            {/* Garantia */}
            <Card className="border-2 border-primary/30 shadow-xl bg-gradient-to-br from-primary/5 to-background mb-6">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                  <div className="p-3 bg-primary/10 rounded-full flex-shrink-0">
                    <Shield className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-black text-base md:text-lg mb-1">
                      Garantia de 7 Dias
                    </h3>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      Se não gostar, devolvemos 100% do seu dinheiro. Sem perguntas.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Coluna Resumo - Sticky Sidebar */}
          <div className="w-full lg:w-[400px]">
            <div className="lg:sticky lg:top-6">
              <Card className="border-2 border-primary/50 shadow-2xl bg-gradient-to-br from-card to-card/50 backdrop-blur">
                <CardHeader className="border-b border-border/50 bg-gradient-to-br from-primary/10 to-transparent p-4 md:p-6">
                  <CardTitle className="flex items-center gap-2 text-lg md:text-2xl">
                    <Star className="w-6 h-6 text-primary" />
                    Resumo do Pedido
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="p-4 md:p-6 space-y-6">
                  {/* Pack 1 */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-bold text-sm md:text-base">{pack1Name}</p>
                        <p className="text-xs text-muted-foreground">6.000 planilhas Excel</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground line-through">
                          R$ {pack1OriginalPrice.toFixed(2)}
                        </p>
                        <p className="font-bold text-primary text-base md:text-lg">
                          R$ {pack1Price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Pack 2 */}
                  {hasUpsell && (
                    <div className="space-y-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-bold text-sm md:text-base">{pack2Name}</p>
                          <p className="text-xs text-muted-foreground">Planner + 50 Dashboards</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground line-through">
                            R$ {pack2OriginalPrice.toFixed(2)}
                          </p>
                          <p className="font-bold text-primary text-base md:text-lg">
                            R$ {pack2Price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="border-t border-border/50 pt-4 space-y-3">
                    <div className="flex justify-between items-center text-xs md:text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-semibold">R$ {totalPrice.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs md:text-sm">
                      <span className="text-muted-foreground">Desconto</span>
                      <span className="font-semibold text-primary">
                        -R$ {hasUpsell 
                          ? ((pack1OriginalPrice + pack2OriginalPrice) - totalPrice).toFixed(2)
                          : (pack1OriginalPrice - pack1Price).toFixed(2)
                        }
                      </span>
                    </div>
                    
                    <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/30 rounded-lg p-4">
                      <div className="flex justify-between items-baseline">
                        <span className="text-base md:text-lg font-bold">Total</span>
                        <div className="text-right">
                          <p className="text-3xl md:text-4xl font-black text-primary">
                            R$ {totalPrice.toFixed(2)}
                          </p>
                          <p className="text-xs text-primary font-semibold">
                            Acesso imediato após pagamento
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Prova Social */}
                  <div className="space-y-3 pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2 text-xs md:text-sm">
                      <Users className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground">
                        <span className="font-bold text-primary">{buyersCount.toLocaleString()}</span> pessoas compraram
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs md:text-sm">
                      <Star className="w-4 h-4 text-primary fill-primary flex-shrink-0" />
                      <span className="text-muted-foreground">
                        Avaliação <span className="font-bold text-primary">4.9/5.0</span>
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs md:text-sm">
                      <Shield className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground">
                        Compra <span className="font-bold text-primary">100% Segura</span>
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

        </div>
      </div>

      {/* Modal de Confirmação Upsell */}
      <AlertDialog open={showUpsellModal} onOpenChange={setShowUpsellModal}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl md:text-2xl flex items-center gap-2">
              🎁 Não perca esta oferta exclusiva!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left space-y-3 text-sm md:text-base">
              <p className="font-semibold text-foreground">
                Por apenas <span className="text-primary text-lg font-bold">R$ 12,99</span> a mais, você ganha:
              </p>
              <ul className="space-y-2 pl-1">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span><strong>Planner Financeiro Premium</strong> - Controle total das suas finanças</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span><strong>50 Dashboards Profissionais</strong> - Análises poderosas</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span><strong>93% de desconto</strong> - De R$ 25,00 por R$ 12,99</span>
                </li>
              </ul>
              <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 mt-4">
                <p className="text-primary font-bold text-center">
                  ⚡ Esta oferta expira em breve!
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel onClick={processPayment} className="w-full sm:w-auto">
              Não, continuar sem o bônus
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                setHasUpsell(true);
                setShowUpsellModal(false);
                setTimeout(processPayment, 100);
              }}
              className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary"
            >
              ✨ Sim, adicionar bônus ao pedido!
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Checkout;
