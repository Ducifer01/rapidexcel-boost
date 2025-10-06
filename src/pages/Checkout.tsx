import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Clock, Check, CreditCard, Lock, Users, TrendingUp, Sparkles, Star, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { formatCPF, validateCPF } from "@/lib/cpf-utils";

const checkoutSchema = z.object({
  name: z.string().trim().min(3, "Nome deve ter pelo menos 3 caracteres").max(100),
  email: z.string().trim().email("E-mail inválido").max(255),
  cpf: z.string().trim().refine((val) => validateCPF(val.replace(/\D/g, '')), {
    message: "CPF inválido",
  }),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").max(50),
});

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({ name: '', email: '', cpf: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [hasUpsell, setHasUpsell] = useState(false);
  const [buyersCount, setBuyersCount] = useState(2847);
  const [showNotification, setShowNotification] = useState(false);
  const [timeLeft, setTimeLeft] = useState(14 * 60 + 43); // 14:43 minutos

  const pack1Price = 12.99;
  const pack2Price = 12.99;
  const totalPrice = hasUpsell ? pack1Price + pack2Price : pack1Price;

  const pack1Name = "Planilhas 6k Pro";
  const pack2Name = "Dashboards+Bônus";
  const pack1OriginalPrice = 197.00;
  const pack2OriginalPrice = 25.00;

  // Efeitos para prova social
  useEffect(() => {
    const buyersInterval = setInterval(() => {
      setBuyersCount(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, Math.random() * 15000 + 10000);

    const notificationInterval = setInterval(() => {
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

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = checkoutSchema.safeParse(formData);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) newErrors[err.path[0] as string] = err.message;
      });
      setErrors(newErrors);
      return;
    }

    handleFinalizePayment();
  };

  const handleFinalizePayment = async () => {
    setLoading(true);
    setErrors({});

    try {
      const productIds = hasUpsell ? ['pack_1', 'pack_2'] : ['pack_1'];
      
      console.log('Iniciando checkout Stripe com:', {
        product_ids: productIds,
        payer: {
          name: formData.name,
          email: formData.email,
        },
      });

      const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
        body: {
          product_ids: productIds,
          payer: {
            name: formData.name,
            email: formData.email,
          },
        },
      });

      if (error) {
        console.error('Erro na função:', error);
        throw new Error(error.message || 'Erro ao processar pagamento');
      }

      if (!data?.url) {
        throw new Error('Link de pagamento não foi gerado');
      }

      console.log('Redirecionando para Stripe Checkout:', data.url);
      
      // Salvar dados do formulário no sessionStorage para usar após pagamento
      sessionStorage.setItem('checkout_data', JSON.stringify({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      }));
      
      window.location.href = data.url;
      
    } catch (error: any) {
      console.error('Erro ao finalizar pagamento:', error);
      toast({
        title: "Erro ao processar pagamento",
        description: error.message || "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const notifications = [
    { name: "Maria Silva", city: "São Paulo" },
    { name: "João Santos", city: "Rio de Janeiro" },
    { name: "Ana Costa", city: "Belo Horizonte" },
    { name: "Pedro Oliveira", city: "Salvador" },
    { name: "Carla Ferreira", city: "Brasília" },
  ];
  
  const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-6 px-4">
      {/* Notificação */}
      {showNotification && (
        <div className="fixed bottom-6 left-6 z-50 animate-in slide-in-from-left duration-500">
          <Card className="border-2 border-primary bg-card shadow-2xl max-w-xs">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="text-2xl">🎉</div>
              <div className="text-sm">
                <p className="font-bold text-foreground">{randomNotification.name}</p>
                <p className="text-muted-foreground">de {randomNotification.city}</p>
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
                  <Badge variant="outline" className="text-xs">
                    Passo 1 de 2
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="p-4 md:p-6">
                <form onSubmit={handleContinue} className="space-y-5">
                  
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
                    <div className="mt-3 p-3 bg-primary/10 border border-primary/30 rounded-lg">
                      <p className="text-xs text-primary font-medium flex items-start gap-2">
                        <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>
                          Essas credenciais serão usadas para acessar suas planilhas após o pagamento.
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Botão */}
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-primary via-primary-glow to-primary hover:opacity-90 text-lg md:text-xl py-6 md:py-8 font-bold shadow-lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processando...
                      </span>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5 md:w-6 md:h-6 mr-2" />
                        FINALIZAR PAGAMENTO
                      </>
                    )}
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

            {/* Upsell Card */}
            <Card 
              className={`border-2 transition-all duration-300 cursor-pointer mb-6 ${
                hasUpsell 
                  ? 'border-secondary bg-gradient-to-br from-secondary/20 via-secondary/10 to-transparent shadow-lg' 
                  : 'border-border/50 bg-card/90 hover:border-secondary/50'
              }`}
              onClick={() => setHasUpsell(!hasUpsell)}
            >
              <CardContent className="p-4 md:p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    hasUpsell ? 'bg-secondary border-secondary' : 'border-border'
                  }`}>
                    {hasUpsell && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Badge className="bg-gradient-to-r from-secondary to-secondary-glow text-white text-xs px-3 py-1 mb-2 animate-pulse inline-block">
                      🎁 OFERTA ESPECIAL
                    </Badge>
                    <h3 className="font-bold text-lg md:text-xl text-foreground">
                      Adicionar {pack2Name}
                    </h3>
                  </div>
                </div>

                <div className="space-y-2 mb-4 ml-9">
                  {[
                    "Planner Financeiro Completo",
                    "+50 Dashboards Premium",
                    "Controle financeiro automático",
                    "Acesso vitalício"
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs md:text-sm">
                      <Star className="w-3.5 h-3.5 md:w-4 md:h-4 text-secondary fill-secondary flex-shrink-0" />
                      <span className="text-muted-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>

                <div className="ml-9 flex flex-wrap items-center gap-2">
                  <span className="text-xs md:text-sm text-muted-foreground line-through whitespace-nowrap tabular-nums">
                    De R$ {pack2OriginalPrice.toFixed(2).replace('.', ',')}
                  </span>
                  <span className="text-2xl md:text-3xl font-black text-secondary whitespace-nowrap tabular-nums">
                    R$ {pack2Price.toFixed(2).replace('.', ',')}
                  </span>
                  <Badge className="bg-red-600 text-white text-xs px-2 py-0.5 border-0 flex-shrink-0">
                    48% OFF
                  </Badge>
                </div>

                <div className="mt-4 ml-9 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>Oferta disponível apenas durante o checkout!</span>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Garantia Card */}
            <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent shadow-lg">
              <CardContent className="p-4 md:p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Shield className="w-6 h-6 md:w-7 md:h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg md:text-xl mb-2 text-primary">Garantia de 7 Dias</h3>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                      Satisfação garantida ou seu dinheiro de volta. Sem perguntas, sem complicações.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resumo do Pedido - Sidebar */}
          <div className="w-full lg:w-96 lg:sticky lg:top-6">
            <Card className="border-2 border-primary/50 bg-gradient-to-br from-card via-card to-primary/5 shadow-xl backdrop-blur">
              <CardHeader className="border-b border-border/50 bg-gradient-to-r from-primary/10 to-transparent p-4 md:p-6">
                <CardTitle className="text-lg md:text-2xl flex items-center gap-2">
                  <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-primary flex-shrink-0" />
                  Resumo do Pedido
                </CardTitle>
              </CardHeader>
              
              <CardContent className="p-4 md:p-6 space-y-5">
                
                {/* Pack 1 */}
                <div className="bg-gradient-to-br from-primary/5 to-transparent rounded-xl p-4 border border-primary/20">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base md:text-lg text-foreground mb-1">{pack1Name}</h3>
                      <p className="text-xs md:text-sm text-muted-foreground">6.000 Planilhas Excel Profissionais</p>
                    </div>
                    <Check className="w-5 h-5 text-primary flex-shrink-0 ml-2" />
                  </div>
                  <div className="space-y-2 mb-3">
                    {["6.000 Planilhas Excel", "Templates para Todos os Negócios", "Suporte Vitalício", "Atualizações Gratuitas"].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs md:text-sm">
                        <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        <span className="text-muted-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-3 border-t border-border/50 flex flex-wrap items-center gap-2">
                    <span className="text-xs md:text-sm text-muted-foreground line-through whitespace-nowrap tabular-nums">
                      De R$ {pack1OriginalPrice.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-2xl md:text-3xl font-black text-primary whitespace-nowrap tabular-nums">
                      R$ {pack1Price.toFixed(2).replace('.', ',')}
                    </span>
                    <Badge className="bg-red-600 text-white text-xs px-2 py-0.5 border-0 flex-shrink-0">
                      93% OFF
                    </Badge>
                  </div>
                </div>

                {/* Pack 2 (se selecionado) */}
                {hasUpsell && (
                  <div className="bg-gradient-to-br from-secondary/10 to-transparent rounded-xl p-4 border-2 border-secondary/40 animate-in slide-in-from-right duration-500">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base md:text-lg text-foreground mb-1">{pack2Name}</h3>
                        <p className="text-xs md:text-sm text-muted-foreground">Planner + 50 Dashboards Premium</p>
                      </div>
                      <Check className="w-5 h-5 text-secondary flex-shrink-0 ml-2" />
                    </div>
                    <div className="space-y-2 mb-3">
                      {["Planner Financeiro Completo", "+50 Dashboards Premium", "Controle Automático", "Acesso Vitalício"].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs md:text-sm">
                          <Star className="w-3.5 h-3.5 text-secondary fill-secondary flex-shrink-0" />
                          <span className="text-muted-foreground">{item}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-3 border-t border-border/50 flex flex-wrap items-center gap-2">
                      <span className="text-xs md:text-sm text-muted-foreground line-through whitespace-nowrap tabular-nums">
                        De R$ {pack2OriginalPrice.toFixed(2).replace('.', ',')}
                      </span>
                      <span className="text-2xl md:text-3xl font-black text-secondary whitespace-nowrap tabular-nums">
                        R$ {pack2Price.toFixed(2).replace('.', ',')}
                      </span>
                      <Badge className="bg-red-600 text-white text-xs px-2 py-0.5 border-0 flex-shrink-0">
                        48% OFF
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Total */}
                <div className="pt-5 border-t-2 border-primary/20">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-lg md:text-xl font-bold text-foreground">TOTAL</span>
                    <div className="text-right">
                      <div className="text-3xl md:text-4xl font-black bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent whitespace-nowrap tabular-nums">
                        R$ {totalPrice.toFixed(2).replace('.', ',')}
                      </div>
                      <div className="text-xs md:text-sm text-muted-foreground whitespace-nowrap tabular-nums mt-1">
                        ou 12x de R$ {(totalPrice / 12).toFixed(2).replace('.', ',')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Prova Social */}
                <div className="space-y-3 pt-5 border-t border-border/50">
                  <h4 className="font-bold text-xs md:text-sm text-muted-foreground uppercase tracking-wider">Prova Social</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Users className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                      </div>
                      <span className="text-xs md:text-sm min-w-0">
                        <strong className="text-primary text-base md:text-lg font-bold tabular-nums">{buyersCount.toLocaleString('pt-BR')}</strong>
                        <span className="text-muted-foreground"> pessoas compraram hoje</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                      </div>
                      <span className="text-xs md:text-sm">
                        <span className="text-muted-foreground">Acesso </span>
                        <strong className="text-foreground">imediato</strong>
                        <span className="text-muted-foreground"> após pagamento</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                      </div>
                      <span className="text-xs md:text-sm">
                        <strong className="text-primary text-base md:text-lg font-bold tabular-nums">98%</strong>
                        <span className="text-muted-foreground"> de satisfação</span>
                      </span>
                    </div>
                  </div>
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