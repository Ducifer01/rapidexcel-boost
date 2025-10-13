import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Check, Gift, FileSpreadsheet, FileText, Presentation } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

const Offers = () => {
  const navigate = useNavigate();

  return (
    <section id="ofertas" className="py-16 md:py-24 px-4 bg-gradient-to-b from-muted/30 to-background">
      <div className="container max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-16 space-y-4">
          <Badge className="mb-4 bg-secondary text-secondary-foreground px-4 py-2 text-sm">
            🔥 OFERTA LIMITADA
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
            Escolha o Pacote Perfeito{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-secondary-glow">
              Para Você!
            </span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Investimento único para acesso vitalício - Sem mensalidades
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          
          {/* Pack 1 - Excel Completo Pro */}
          <Card className="border-2 border-primary hover:shadow-[0_12px_40px_-8px_hsl(var(--primary)/0.4)] transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/20 to-transparent rounded-bl-full" />
            <CardHeader className="text-center pb-8 pt-8 relative">
              <Badge className="mb-4 mx-auto bg-primary text-primary-foreground w-fit">
                MAIS VENDIDO
              </Badge>
              <div className="flex items-center justify-center gap-3 mb-3">
                <FileSpreadsheet className="w-8 h-8 text-primary" />
                <h3 className="text-2xl md:text-3xl font-bold">Pack Excel Completo Pro</h3>
              </div>
              <p className="text-muted-foreground mb-6">13.000 Planilhas Excel Profissionais</p>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground line-through">
                  De R$ 1.997,00
                </p>
                <p className="text-5xl md:text-6xl font-bold text-primary">
                  R$ 12,99
                </p>
                <p className="text-sm text-muted-foreground">pagamento único • <span className="text-primary font-bold">93% OFF</span></p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pb-8">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm md:text-base">
                    <strong className="font-bold">13.000+ Planilhas Excel</strong> profissionais editáveis
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm md:text-base">
                    <strong className="font-bold">+50 Dashboards</strong> extras premium
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm md:text-base">
                    Todas as categorias: <strong>Finanças, RH, Vendas, Engenharia, Logística, Pessoal</strong> e mais
                  </span>
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
                onClick={() => navigate('/checkout')}
              >
                Começar Agora - R$ 12,99
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                ⚡ Economize mais de 200 horas de trabalho
              </p>
            </CardContent>
          </Card>

          {/* Pack 2 - Office Premium (Upsell) */}
          <Card className="border-2 border-secondary hover:shadow-[0_12px_40px_-8px_hsl(var(--secondary)/0.4)] transition-all duration-300 relative overflow-hidden bg-gradient-to-br from-secondary/5 to-transparent">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-secondary/20 to-transparent rounded-bl-full" />
            <CardHeader className="text-center pb-8 pt-8 relative">
              <Badge className="mb-4 mx-auto bg-gradient-to-r from-amber-500 to-orange-500 text-white w-fit animate-pulse">
                <Gift className="w-4 h-4 mr-1" />
                PACOTE PREMIUM
              </Badge>
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="flex -space-x-2">
                  <FileText className="w-7 h-7 text-secondary" />
                  <Presentation className="w-7 h-7 text-secondary" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold">Pack Office Premium</h3>
              </div>
              <p className="text-muted-foreground mb-6">
                Templates Word + Slides PowerPoint + Bônus
              </p>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground line-through">
                  De R$ 3.997,00
                </p>
                <p className="text-5xl md:text-6xl font-bold text-secondary">
                  R$ 29,99
                </p>
                <p className="text-sm text-muted-foreground">pagamento único • <span className="text-secondary font-bold">94% OFF</span></p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pb-8">
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg mb-4">
                <p className="text-sm font-bold text-amber-600 text-center">
                  💎 UPGRADE COMPLETO: Tudo do Pack 1 + Muito Mais!
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                  <span className="text-sm md:text-base">
                    <strong className="font-bold">✅ TUDO do Pack Excel</strong> (13.000 planilhas + dashboards)
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                  <span className="text-sm md:text-base">
                    <strong className="font-bold">+2.000 Templates Word</strong> profissionais (contratos, propostas, relatórios)
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                  <span className="text-sm md:text-base">
                    <strong className="font-bold">+50.000 Slides PowerPoint</strong> para apresentações impactantes
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Gift className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm md:text-base">
                    <strong className="font-bold text-amber-600">BÔNUS:</strong> +6.000 planilhas Excel extras exclusivas
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Gift className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm md:text-base">
                    <strong className="font-bold text-amber-600">BÔNUS:</strong> Materiais exclusivos (ex: Como Conquistar Clientes)
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                  <span className="text-sm md:text-base">Acesso vitalício a TUDO</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                  <span className="text-sm md:text-base">Suporte prioritário</span>
                </div>
              </div>
              <div className="p-3 bg-secondary/10 border border-secondary/30 rounded-lg">
                <p className="text-sm font-bold text-center">
                  💰 Economia Total: <span className="text-secondary text-xl">R$ 3.967</span>
                </p>
                <p className="text-xs text-center text-muted-foreground mt-1">
                  Mais de 60.000 arquivos por menos de R$ 0,001 cada!
                </p>
              </div>
              <Button 
                size="lg" 
                className="w-full bg-gradient-to-r from-secondary to-secondary-glow hover:opacity-90 text-lg py-6 shadow-[0_10px_40px_-10px_hsl(var(--secondary)/0.5)] hover:shadow-[0_15px_50px_-10px_hsl(var(--secondary)/0.6)] transition-all duration-300"
                onClick={() => navigate('/checkout')}
              >
                Quero o Pacote Completo - R$ 29,99
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                ⚡ Melhor custo-benefício: Mais de 60.000 arquivos!
              </p>
            </CardContent>
          </Card>

        </div>

        {/* Garantia */}
        <div className="mt-12 text-center max-w-3xl mx-auto">
          <div className="p-6 bg-primary/10 border-2 border-primary/30 rounded-2xl">
            <p className="text-lg font-bold mb-2">🛡️ Garantia de 7 Dias</p>
            <p className="text-sm text-muted-foreground">
              Se você não ficar completamente satisfeito, devolvemos 100% do seu dinheiro. Sem perguntas, sem burocracia.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Offers;
