import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Clock, Check, CreditCard, Lock, Users, TrendingUp, Sparkles, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const checkoutSchema = z.object({
  name: z.string().trim().min(3, "Nome deve ter pelo menos 3 caracteres").max(100),
  email: z.string().trim().email("E-mail inválido").max(255),
  cpf: z.string().trim().regex(/^\d{11}$/, "CPF deve conter 11 dígitos"),
});

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({ name: '', email: '', cpf: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showUpsell, setShowUpsell] = useState(false);
  const [hasUpsell, setHasUpsell] = useState(false);

  const pack1Price = 12.99;
  const pack2Price = 12.99;
  const totalPrice = hasUpsell ? pack1Price + pack2Price : pack1Price;

  const pack1Name = "Planilhas 6k Pro";
  const pack2Name = "Dashboards+Bônus";

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleContinue = (e: React.FormEvent) => {
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

    // Mostrar upsell apenas se ainda não foi adicionado
    if (!hasUpsell) {
      setShowUpsell(true);
    } else {
      handleFinalizePayment();
    }
  };

  const handleAddUpsell = () => {
    setHasUpsell(true);
    setShowUpsell(false);
  };

  const handleSkipUpsell = () => {
    setShowUpsell(false);
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

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      {/* Modal Upsell */}
      {showUpsell && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full border-2 border-secondary shadow-2xl">
            <CardHeader className="text-center pb-3 relative">
              <Badge className="mb-3 mx-auto bg-secondary text-secondary-foreground w-fit text-sm px-4 py-1.5">
                🎁 OFERTA EXCLUSIVA!
              </Badge>
              <CardTitle className="text-2xl font-bold mb-2">
                Espere! Oferta Única
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                Adicione o Pack Premium por apenas <span className="text-secondary font-bold">R$ 12,99</span>
              </p>
            </CardHeader>
            <CardContent className="space-y-4 pb-6">
              <div className="bg-gradient-to-br from-secondary/10 to-transparent rounded-lg p-4 border border-secondary/20">
                <h3 className="text-xl font-bold mb-3 text-center">
                  {pack2Name}
                </h3>
                <div className="space-y-2 mb-4">
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Planner Financeiro Completo</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">+50 Dashboards Premium</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Controle financeiro automático</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Acesso vitalício</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-card rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">
                    <span className="line-through">Valor normal: R$ 25,00</span>
                  </p>
                  <p className="text-3xl font-bold text-secondary mb-1">
                    R$ 12,99
                  </p>
                  <Badge className="bg-destructive text-destructive-foreground text-xs">
                    48% OFF - ECONOMIZE R$ 12,01
                  </Badge>
                </div>
              </div>

              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-center">
                <p className="font-bold text-destructive text-sm mb-0.5">⚠️ Esta oferta não se repete!</p>
                <p className="text-xs text-muted-foreground">
                  Se sair desta página, perderá este desconto especial
                </p>
              </div>

              <div className="space-y-2">
                <Button 
                  size="lg" 
                  className="w-full bg-gradient-to-r from-secondary to-secondary-glow hover:opacity-90 text-white"
                  onClick={handleAddUpsell}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  SIM! Quero Adicionar
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full"
                  onClick={handleSkipUpsell}
                >
                  Não, quero apenas {pack1Name}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="container max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge className="mb-4 bg-primary text-primary-foreground">
            🔒 CHECKOUT SEGURO
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Finalize Sua Compra
          </h1>
          <p className="text-muted-foreground">
            Acesso imediato após confirmação do pagamento
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Coluna esquerda - Formulário */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" />
                  Seus Dados
                </CardTitle>
              </CardHeader>
              <CardContent>
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
                      <Label htmlFor="email">E-mail *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={errors.email ? "border-destructive" : ""}
                        disabled={loading}
                      />
                      {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                      <p className="text-xs text-muted-foreground mt-1">
                        Seu acesso será enviado para este e-mail
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="cpf">CPF *</Label>
                      <Input
                        id="cpf"
                        placeholder="Apenas números"
                        value={formData.cpf}
                        onChange={(e) => handleInputChange('cpf', e.target.value.replace(/\D/g, ''))}
                        maxLength={11}
                        className={errors.cpf ? "border-destructive" : ""}
                        disabled={loading}
                      />
                      {errors.cpf && <p className="text-sm text-destructive mt-1">{errors.cpf}</p>}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 text-lg py-6"
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? "Processando..." : (
                      <>
                        <CreditCard className="w-5 h-5 mr-2" />
                        {hasUpsell ? "Finalizar Pagamento" : "Continuar"}
                      </>
                    )}
                  </Button>

                  <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Shield className="w-4 h-4" />
                      <span>Pagamento 100% Seguro</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Lock className="w-4 h-4" />
                      <span>SSL Criptografado</span>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Garantia */}
            <Card className="mt-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Garantia de 7 Dias</h3>
                    <p className="text-sm text-muted-foreground">
                      Se você não ficar satisfeito, devolvemos 100% do seu dinheiro. 
                      Sem perguntas, sem complicações. Teste por 7 dias sem riscos!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna direita - Resumo */}
          <div className="lg:col-span-2">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {/* Pack 1 */}
                  <div className="flex justify-between items-start pb-4 border-b">
                    <div className="flex-1">
                      <h3 className="font-bold">{pack1Name}</h3>
                      <p className="text-sm text-muted-foreground">6.000 Planilhas Excel</p>
                    </div>
                    <p className="font-bold">R$ 12,99</p>
                  </div>

                  {/* Pack 2 (se adicionado) */}
                  {hasUpsell && (
                    <div className="flex justify-between items-start pb-4 border-b bg-secondary/5 -mx-6 px-6 py-4">
                      <div className="flex-1">
                        <Badge className="mb-2 bg-secondary text-secondary-foreground">
                          ADICIONADO!
                        </Badge>
                        <h3 className="font-bold">{pack2Name}</h3>
                        <p className="text-sm text-muted-foreground">Planner + 50 Dashboards</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm line-through text-muted-foreground">R$ 25,00</p>
                        <p className="font-bold text-secondary">R$ 12,99</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">Total</span>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary">
                        R$ {totalPrice.toFixed(2)}
                      </div>
                      {hasUpsell && (
                        <Badge className="bg-secondary text-secondary-foreground mt-1">
                          Economizou R$ 12,01
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Social Proof */}
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center gap-3 text-sm">
                    <Users className="w-5 h-5 text-primary" />
                    <span className="text-muted-foreground">
                      <strong className="text-foreground">2.847 pessoas</strong> compraram hoje
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-5 h-5 text-primary" />
                    <span className="text-muted-foreground">
                      <strong className="text-foreground">Acesso imediato</strong> após pagamento
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <span className="text-muted-foreground">
                      <strong className="text-foreground">98% de satisfação</strong> dos clientes
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Depoimentos rápidos */}
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold mb-6">O que nossos clientes dizem</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { name: "Maria S.", text: "Salvou minha empresa! As planilhas são incríveis." },
              { name: "João P.", text: "Melhor investimento que fiz. Vale cada centavo!" },
              { name: "Ana L.", text: "Recebi na hora. Suporte excelente. Recomendo!" },
            ].map((review, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-2 justify-center">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-500">★</span>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground italic mb-2">"{review.text}"</p>
                  <p className="text-sm font-bold">- {review.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
