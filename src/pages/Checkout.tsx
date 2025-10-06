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
  const [timeLeft, setTimeLeft] = useState(14 * 60 + 43); // 14:43 minutos em segundos

  const pack1Price = 12.99;
  const pack2Price = 12.99;
  const totalPrice = hasUpsell ? pack1Price + pack2Price : pack1Price;

  const pack1Name = "Planilhas 6k Pro";
  const pack2Name = "Dashboards+Bônus";

  // Preços originais para mostrar desconto
  const pack1OriginalPrice = 197.00;
  const pack2OriginalPrice = 25.00;

  // Efeitos para prova social
  useEffect(() => {
    // Incrementa contador de compradores
    const buyersInterval = setInterval(() => {
      setBuyersCount(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, Math.random() * 15000 + 10000);

    // Mostra notificações de compra
    const notificationInterval = setInterval(() => {
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 4000);
    }, Math.random() * 20000 + 15000);

    return () => {
      clearInterval(buyersInterval);
      clearInterval(notificationInterval);
    };
  }, []);

  // Cronômetro de urgência
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Garantir que a página comece do topo
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Formatar tempo restante
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (field: string, value: string) => {
    let processedValue = value;
    
    // Auto-formatar CPF
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

    try {
      // IMPORTANTE: Não enviar preços! Apenas IDs dos produtos
      const productIds = hasUpsell ? ['pack_1', 'pack_2'] : ['pack_1'];

      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          product_ids: productIds, // Enviar apenas IDs
          password: formData.password, // Enviar senha para criar usuário após pagamento
          payer: {
            email: formData.email,
            name: formData.name,
            identification: {
              type: 'CPF',
              number: formData.cpf,
            },
          },
        },
      });

      if (error) throw error;

      if (data?.init_point) {
        window.location.href = data.init_point;
      } else {
        throw new Error('Erro ao processar pagamento');
      }
    } catch (error) {
      console.error('Erro no checkout:', error);
      toast({
        title: "Erro ao processar pagamento",
        description: "Tente novamente em alguns instantes.",
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-4 md:py-8 px-3 md:px-4">
      {/* Notificação de compra em tempo real */}
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

      <div className="container max-w-7xl mx-auto">
        {/* Header com Selo de Segurança */}
        <div className="text-center mb-10">
          <Badge className="mb-6 bg-gradient-to-r from-primary to-primary-glow text-white px-6 py-2.5 text-base shadow-[0_8px_30px_rgba(var(--primary),0.3)] animate-pulse">
            <Shield className="w-4 h-4 mr-2 inline" />
            CHECKOUT 100% SEGURO
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Finalize Sua Compra
          </h1>
          <p className="text-lg text-muted-foreground mb-4">
            <Clock className="w-4 h-4 inline mr-1" />
            Acesso <span className="text-primary font-bold">imediato</span> após confirmação do pagamento
          </p>
          
          {/* Cronômetro de Urgência */}
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-destructive/20 via-orange-500/20 to-destructive/20 border-2 border-destructive/50 rounded-full px-6 py-3 shadow-lg animate-pulse">
            <Clock className="w-5 h-5 text-destructive" />
            <span className="text-sm font-semibold text-foreground">
              Esta oferta termina em:
            </span>
            <span className="text-2xl font-black text-destructive tabular-nums">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Coluna esquerda - Formulário */}
          <div className="space-y-6">
            <Card className="border-2 border-border/50 shadow-2xl bg-card/80 backdrop-blur">
              <CardHeader className="border-b border-border/50 bg-gradient-to-br from-primary/5 to-transparent">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Lock className="w-6 h-6 text-primary" />
                    </div>
                    Seus Dados
                  </CardTitle>
                  <Badge variant="outline" className="text-xs">
                    Passo 1 de 2
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleContinue} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nome Completo *</Label>
                      <Input
                        id="name"
                        placeholder="Como está no seu documento"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className={errors.name ? "border-destructive" : ""}
                        disabled={loading}
                      />
                      {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-base font-semibold">E-mail *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={errors.email ? "border-destructive h-12" : "h-12"}
                        disabled={loading}
                      />
                      {errors.email && <p className="text-sm text-destructive mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.email}</p>}
                    </div>

                    <div>
                      <Label htmlFor="cpf" className="text-base font-semibold">CPF *</Label>
                      <Input
                        id="cpf"
                        placeholder="000.000.000-00"
                        value={formData.cpf}
                        onChange={(e) => handleInputChange('cpf', e.target.value)}
                        maxLength={14}
                        className={errors.cpf ? "border-destructive h-12" : "h-12"}
                        disabled={loading}
                      />
                      {errors.cpf && <p className="text-sm text-destructive mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.cpf}</p>}
                    </div>

                    <div>
                      <Label htmlFor="password" className="text-base font-semibold">Senha *</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className={errors.password ? "border-destructive h-12" : "h-12"}
                        disabled={loading}
                      />
                      {errors.password && <p className="text-sm text-destructive mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.password}</p>}
                      <div className="mt-2 p-3 bg-primary/10 border border-primary/30 rounded-lg">
                        <p className="text-xs text-primary font-medium flex items-start gap-2">
                          <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span>
                            Essas credenciais (email + senha) serão usadas para você acessar e baixar suas planilhas após a confirmação do pagamento.
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-primary via-primary-glow to-primary hover:opacity-90 text-xl py-8 font-bold shadow-[0_10px_40px_rgba(var(--primary),0.4)] hover:shadow-[0_15px_50px_rgba(var(--primary),0.5)] transition-all duration-300"
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processando...
                      </span>
                    ) : (
                      <>
                        <CreditCard className="w-6 h-6 mr-2" />
                        FINALIZAR PAGAMENTO
                      </>
                    )}
                  </Button>

                  <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground pt-4">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-primary" />
                      <span>Pagamento Seguro</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Lock className="w-5 h-5 text-primary" />
                      <span>SSL Criptografado</span>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Oferta Especial - Upsell */}
            <Card 
              className={`border-2 transition-all duration-300 cursor-pointer ${
                hasUpsell 
                  ? 'border-secondary bg-gradient-to-br from-secondary/20 via-secondary/10 to-transparent shadow-[0_0_40px_rgba(var(--secondary),0.3)]' 
                  : 'border-border/50 bg-card/80 hover:border-secondary/50 hover:shadow-[0_0_20px_rgba(var(--secondary),0.15)]'
              }`}
              onClick={() => setHasUpsell(!hasUpsell)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                        hasUpsell ? 'bg-secondary border-secondary' : 'border-border'
                      }`}>
                        {hasUpsell && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <div>
                        <Badge className="bg-gradient-to-r from-secondary to-secondary-glow text-white text-xs px-3 py-1 mb-2 animate-pulse">
                          🎁 OFERTA ESPECIAL
                        </Badge>
                        <h3 className="font-bold text-xl text-foreground">
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
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <Star className="w-4 h-4 text-secondary fill-secondary flex-shrink-0" />
                          <span className="text-muted-foreground">{benefit}</span>
                        </div>
                      ))}
                    </div>

                    <div className="ml-9 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                      <span className="text-sm text-muted-foreground line-through whitespace-nowrap">De R$ {pack2OriginalPrice.toFixed(2)}</span>
                      <span className="text-3xl font-black text-secondary whitespace-nowrap">R$ {pack2Price.toFixed(2).replace('.', ',')}</span>
                      <Badge className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5 shadow-lg border-0 w-fit">
                        48% OFF
                      </Badge>
                    </div>

                    <div className="mt-4 ml-9 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                      <p className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>Esta oferta especial só está disponível agora durante o checkout!</span>
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Garantias */}
            <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent shadow-[0_0_30px_rgba(var(--primary),0.15)]">
              <CardContent className="p-6 space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Shield className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-2 text-primary">Garantia de 7 Dias</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Se você não ficar satisfeito, devolvemos <strong className="text-foreground">100% do seu dinheiro</strong>. 
                      Sem perguntas, sem complicações. Teste por 7 dias sem riscos!
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Lock className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">Pagamento</p>
                      <p className="text-xs text-muted-foreground">100% Seguro</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">Acesso</p>
                      <p className="text-xs text-muted-foreground">Imediato</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna direita - Resumo */}
          <div className="lg:sticky lg:top-8 space-y-6">
            <Card className="border-2 border-border/50 shadow-2xl bg-card/80 backdrop-blur">
              <CardHeader className="border-b border-border/50 bg-gradient-to-br from-secondary/5 to-transparent">
                <CardTitle className="text-2xl">Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-5">
                  {/* Pack 1 */}
                  <div className="bg-gradient-to-br from-primary/5 to-transparent rounded-xl p-5 border border-primary/20 space-y-3">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1">{pack1Name}</h3>
                        <p className="text-sm text-muted-foreground">6.000 Planilhas Excel Profissionais</p>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      {["6.000 Planilhas Excel", "Templates para Todos os Negócios", "Suporte Vitalício", "Atualizações Gratuitas"].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-primary" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 pt-4 border-t border-border/50">
                      <span className="text-sm text-muted-foreground line-through whitespace-nowrap">De R$ {pack1OriginalPrice.toFixed(2)}</span>
                      <span className="text-3xl font-black text-primary whitespace-nowrap">R$ {pack1Price.toFixed(2).replace('.', ',')}</span>
                      <Badge className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5 shadow-lg border-0 w-fit">
                        93% OFF
                      </Badge>
                    </div>
                  </div>

                  {/* Pack 2 (se adicionado) */}
                  {hasUpsell && (
                    <div className="bg-gradient-to-br from-secondary/10 to-transparent rounded-xl p-5 border-2 border-secondary/40 animate-in slide-in-from-right duration-500">
                      <Badge className="mb-3 bg-gradient-to-r from-secondary to-secondary-glow text-white animate-pulse">
                        ✓ ADICIONADO!
                      </Badge>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-1">{pack2Name}</h3>
                          <p className="text-sm text-muted-foreground">Planner + 50 Dashboards Premium</p>
                        </div>
                      </div>
                      <div className="space-y-2 mb-4">
                        {["Planner Financeiro Completo", "+50 Dashboards Premium", "Controle Automático", "Acesso Vitalício"].map((item, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <Star className="w-4 h-4 text-secondary fill-secondary" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 pt-4 border-t border-border/50">
                        <span className="text-sm text-muted-foreground line-through whitespace-nowrap">De R$ {pack2OriginalPrice.toFixed(2)}</span>
                        <span className="text-3xl font-black text-secondary whitespace-nowrap">R$ {pack2Price.toFixed(2).replace('.', ',')}</span>
                        <Badge className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5 shadow-lg border-0 w-fit">
                          48% OFF
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t-2 border-border pt-6 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 text-xl">
                    <span className="font-bold">TOTAL</span>
                    <div className="text-left sm:text-right">
                      <div className="text-4xl font-black text-primary mb-1 whitespace-nowrap">
                        R$ {totalPrice.toFixed(2).replace('.', ',')}
                      </div>
                      {hasUpsell && (
                        <Badge className="bg-gradient-to-r from-secondary to-secondary-glow text-white text-sm w-fit">
                          Você economizou R$ 12,01
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Social Proof */}
                <div className="space-y-4 pt-6 border-t border-border/50">
                  <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Prova Social</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-sm">
                        <strong className="text-primary text-lg font-bold">{buyersCount.toLocaleString('pt-BR')}</strong>
                        <span className="text-muted-foreground"> pessoas compraram hoje</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-sm">
                        <span className="text-muted-foreground">Acesso </span>
                        <strong className="text-foreground">imediato</strong>
                        <span className="text-muted-foreground"> após pagamento</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-sm">
                        <strong className="text-primary text-lg font-bold">98%</strong>
                        <span className="text-muted-foreground"> de satisfação</span>
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Depoimentos */}
            <Card className="border border-border/50 bg-card/50">
              <CardContent className="p-6">
                <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-4">
                  O que nossos clientes dizem:
                </h4>
                <div className="space-y-4">
                  {[
                    { name: "Maria Silva", role: "Empresária", text: "Organizei toda minha empresa em 1 semana! As planilhas são profissionais e muito fáceis de usar." },
                    { name: "João Santos", role: "Contador", text: "Economizei mais de R$ 5.000 em consultoria. Melhor investimento que já fiz!" }
                  ].map((review, i) => (
                    <div key={i} className="p-4 bg-card rounded-lg border border-border/30">
                      <div className="flex gap-0.5 mb-2">
                        {[...Array(5)].map((_, j) => (
                          <Star key={j} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground italic mb-2">"{review.text}"</p>
                      <div className="text-sm">
                        <p className="font-bold text-foreground">- {review.name}</p>
                        <p className="text-xs text-muted-foreground">{review.role}</p>
                      </div>
                    </div>
                  ))}
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
