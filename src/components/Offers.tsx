import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Check, Sparkles, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { createPaymentPreference, redirectToCheckout } from "@/services/mercadopago";
const Offers = () => {
  return (
    <section id="ofertas" className="py-16 md:py-24 px-4 bg-gradient-to-b from-muted/30 to-background">
      <div className="container max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-16 space-y-4">
          <Badge className="mb-4 bg-secondary text-secondary-foreground px-4 py-2 text-sm">
            🔥 OFERTA ESPECIAL
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
            Escolha Seu Pacote e{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-secondary-glow">
              Comece Agora!
            </span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Investimento único para acesso vitalício
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Pack 1 - Principal */}
          <Card className="border-2 border-primary hover:shadow-[0_12px_40px_-8px_hsl(var(--primary)/0.4)] transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/20 to-transparent rounded-bl-full" />
            <CardHeader className="text-center pb-8 pt-8 relative">
              <Badge className="mb-4 mx-auto bg-primary text-primary-foreground w-fit">
                MAIS POPULAR
              </Badge>
              <h3 className="text-2xl md:text-3xl font-bold mb-2">Pack 1</h3>
              <p className="text-muted-foreground mb-6">Pacote Principal</p>
              <div className="space-y-2">
                <p className="text-5xl md:text-6xl font-bold text-primary">
                  R$ 12,99
                </p>
                <p className="text-sm text-muted-foreground">pagamento único</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pb-8">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm md:text-base">
                    <strong className="font-bold">6.000 Planilhas Excel</strong> editáveis
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm md:text-base">Todas as categorias incluídas</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm md:text-base">Acesso imediato após pagamento</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm md:text-base">Acesso vitalício sem renovação</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm md:text-base">Suporte por e-mail</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm md:text-base">Garantia de 7 dias</span>
                </div>
              </div>
              <Button 
                size="lg" 
                className="w-full bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 text-lg py-6 shadow-[0_10px_40px_-10px_hsl(var(--primary)/0.5)] hover:shadow-[0_15px_50px_-10px_hsl(var(--primary)/0.6)] transition-all duration-300"
                onClick={async () => {
                  const email = window.prompt('Digite seu e-mail para receber o acesso:')?.trim();
                  if (!email) return;
                  try {
                    const { preference_id, init_point } = await createPaymentPreference({
                      items: [{ title: 'Pack 1 - 6.000 Planilhas Excel', quantity: 1, unit_price: 12.99 }],
                      payer: { email },
                    });
                    if (init_point) {
                      redirectToCheckout(init_point);
                    }
                  } catch (e) {
                    console.error(e);
                    alert('Erro ao iniciar pagamento. Tente novamente.');
                  }
                }}
              >
                Comprar Pack 1
              </Button>
            </CardContent>
          </Card>

          {/* Pack 2 - Upsell */}
          <Card className="border-2 border-secondary hover:shadow-[0_12px_40px_-8px_hsl(var(--secondary)/0.4)] transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-secondary/20 to-transparent rounded-bl-full" />
            <CardHeader className="text-center pb-8 pt-8 relative">
              <Badge className="mb-4 mx-auto bg-secondary text-secondary-foreground w-fit">
                <Sparkles className="w-4 h-4 mr-1" />
                OFERTA COMBO
              </Badge>
              <h3 className="text-2xl md:text-3xl font-bold mb-2">Pack 2</h3>
              <p className="text-muted-foreground mb-6">Upgrade Premium</p>
              <div className="space-y-2">
                <p className="text-lg line-through text-muted-foreground">R$ 25,00</p>
                <p className="text-5xl md:text-6xl font-bold text-secondary">
                  R$ 12,99
                </p>
                <p className="text-sm font-bold text-secondary flex items-center justify-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  48% OFF comprando junto!
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pb-8">
              <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/20 mb-4">
                <p className="text-sm font-bold text-center">
                  ✨ Adicione ao Pack 1 e economize R$ 12,01!
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                  <span className="text-sm md:text-base">
                    <strong className="font-bold">Planner de Organização Financeira</strong> Pessoal completo
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                  <span className="text-sm md:text-base">
                    <strong className="font-bold">+50 Dashboards Premium</strong> extras
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                  <span className="text-sm md:text-base">Controle financeiro automático</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                  <span className="text-sm md:text-base">Análises de vendas, RH e finanças</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                  <span className="text-sm md:text-base">Acesso vitalício</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                  <span className="text-sm md:text-base">Garantia de 7 dias</span>
                </div>
              </div>
              <Button 
                size="lg" 
                className="w-full bg-gradient-to-r from-[hsl(var(--gold))] to-[hsl(var(--gold-glow))] hover:opacity-90 text-lg py-6 shadow-[0_10px_40px_-10px_hsl(var(--gold)/0.5)] hover:shadow-[0_15px_50px_-10px_hsl(var(--gold)/0.6)] transition-all duration-300"
                onClick={async () => {
                  const email = window.prompt('Digite seu e-mail para receber o acesso:')?.trim();
                  if (!email) return;
                  try {
                    const { preference_id, init_point } = await createPaymentPreference({
                      items: [{ title: 'Pack 2 - Planner + 50 Dashboards', quantity: 1, unit_price: 12.99 }],
                      payer: { email },
                    });
                    if (init_point) {
                      redirectToCheckout(init_point);
                    }
                  } catch (e) {
                    console.error(e);
                    alert('Erro ao iniciar pagamento. Tente novamente.');
                  }
                }}
              >
                Adicionar Pack 2
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Oferta Combo Total */}
        <Card className="mt-12 max-w-3xl mx-auto border-2 border-accent bg-gradient-to-br from-accent/5 to-transparent hover:shadow-[0_12px_40px_-8px_hsl(var(--accent)/0.4)] transition-all duration-300">
          <CardContent className="p-8 text-center space-y-6">
            <Badge className="bg-accent text-accent-foreground text-base px-6 py-2">
              🎁 COMBO COMPLETO
            </Badge>
            <h3 className="text-2xl md:text-3xl font-bold">
              Leve os 2 Pacotes Juntos!
            </h3>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <span className="text-3xl font-bold">Pack 1 + Pack 2</span>
              <span className="text-2xl">=</span>
              <div>
                <p className="text-lg line-through text-muted-foreground">R$ 37,99</p>
                <p className="text-4xl md:text-5xl font-bold text-accent">R$ 25,98</p>
              </div>
            </div>
            <p className="text-lg text-muted-foreground">
              Mais de <strong>6.050 planilhas e dashboards</strong> pelo menor preço!
            </p>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-accent to-accent/80 hover:opacity-90 text-lg px-12 py-6 shadow-[0_10px_40px_-10px_hsl(var(--accent)/0.5)] hover:shadow-[0_15px_50px_-10px_hsl(var(--accent)/0.6)] transition-all duration-300 whitespace-normal h-auto leading-tight"
                onClick={async () => {
                  const email = window.prompt('Digite seu e-mail para receber o acesso:')?.trim();
                  if (!email) return;
                  try {
                    const { preference_id, init_point } = await createPaymentPreference({
                      items: [
                        { title: 'Pack 1 - 6.000 Planilhas Excel', quantity: 1, unit_price: 12.99 },
                        { title: 'Pack 2 - Planner + 50 Dashboards', quantity: 1, unit_price: 12.99 }
                      ],
                      payer: { email },
                    });
                    if (init_point) {
                      redirectToCheckout(init_point);
                    }
                  } catch (e) {
                    console.error(e);
                    alert('Erro ao iniciar pagamento. Tente novamente.');
                  }
                }}
              >
                Aproveitar Promoção
              </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default Offers;
