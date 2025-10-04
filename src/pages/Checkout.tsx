import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Clock, Check, CreditCard, Lock, Users, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const checkoutSchema = z.object({
  name: z.string().trim().min(3, "Nome deve ter pelo menos 3 caracteres").max(100),
  email: z.string().trim().email("E-mail inválido").max(255),
  cpf: z.string().trim().regex(/^\d{11}$/, "CPF deve conter 11 dígitos"),
});

const packages = {
  pack1: {
    id: 'pack_1',
    name: 'Pack 1',
    fullName: '6.000 Planilhas Excel',
    price: 12.99,
    originalPrice: undefined,
    items: ['6.000 planilhas editáveis', 'Todas as categorias', 'Acesso vitalício'],
  },
  pack2: {
    id: 'pack_2',
    name: 'Pack 2',
    fullName: 'Planner + 50 Dashboards',
    price: 12.99,
    originalPrice: 25.00,
    items: ['Planner Financeiro completo', '+50 Dashboards Premium', 'Acesso vitalício'],
  },
  combo: {
    id: 'combo',
    name: 'Combo Completo',
    fullName: 'Pack 1 + Pack 2',
    price: 25.98,
    originalPrice: 37.99,
    items: ['6.000 planilhas editáveis', 'Planner Financeiro', '+50 Dashboards Premium', 'Acesso vitalício'],
  },
};

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const packageType = (searchParams.get('package') || 'combo') as keyof typeof packages;
  const selectedPackage = packages[packageType];

  const [formData, setFormData] = useState({ name: '', email: '', cpf: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validação
    const result = checkoutSchema.safeParse(formData);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) newErrors[err.path[0] as string] = err.message;
      });
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      // Criar preferência de pagamento
      const items = packageType === 'combo'
        ? [
            { title: 'Pack 1 - 6.000 Planilhas Excel', quantity: 1, unit_price: 12.99 },
            { title: 'Pack 2 - Planner + 50 Dashboards', quantity: 1, unit_price: 12.99 }
          ]
        : [{ title: selectedPackage.fullName, quantity: 1, unit_price: selectedPackage.price }];

      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          items,
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
      <div className="container max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge className="mb-4 bg-secondary text-secondary-foreground">
            🔥 OFERTA POR TEMPO LIMITADO
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Últimas unidades disponíveis!
          </h1>
          <p className="text-muted-foreground">
            Milhares de pessoas já adquiriram. Garanta o seu agora!
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Coluna esquerda - Formulário */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" />
                  Checkout Seguro
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Progress */}
                  <div className="flex items-center gap-2 mb-6">
                    <div className="flex items-center gap-2 text-primary">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">1</div>
                      <span className="text-sm font-medium">Seus dados</span>
                    </div>
                    <div className="flex-1 h-1 bg-border"></div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold">2</div>
                      <span className="text-sm">Pagamento</span>
                    </div>
                  </div>

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
                        Ir para Pagamento
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
                <div>
                  <h3 className="font-bold text-xl mb-4">{selectedPackage.name}</h3>
                  <div className="space-y-2">
                    {selectedPackage.items.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  {selectedPackage.originalPrice && (
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Valor original</span>
                      <span className="line-through">R$ {selectedPackage.originalPrice.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">Total</span>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary">
                        R$ {selectedPackage.price.toFixed(2)}
                      </div>
                      {selectedPackage.originalPrice && (
                        <Badge className="bg-secondary text-secondary-foreground mt-1">
                          Economize R$ {(selectedPackage.originalPrice - selectedPackage.price).toFixed(2)}
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

                {/* Urgência */}
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <p className="text-sm font-bold text-destructive text-center">
                    ⚠️ Promoção válida por tempo limitado!
                  </p>
                  <p className="text-xs text-center text-muted-foreground mt-1">
                    Preço pode aumentar a qualquer momento
                  </p>
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
