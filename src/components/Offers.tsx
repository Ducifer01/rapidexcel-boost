import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

const Offers = () => {
  const navigate = useNavigate();

  return (
    <section id="ofertas" className="py-16 md:py-24 px-4 bg-gradient-to-b from-muted/30 to-background">
      <div className="container max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-16 space-y-4">
          <Badge className="mb-4 bg-secondary text-secondary-foreground px-4 py-2 text-sm">
            🔥 OFERTA ESPECIAL
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
            Transforme Seu Negócio com{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-secondary-glow">
              Milhares de Planilhas!
            </span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Investimento único para acesso vitalício
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 max-w-2xl mx-auto">
          {/* Pack 1 - Principal (ÚNICO) */}
          <Card className="border-2 border-primary hover:shadow-[0_12px_40px_-8px_hsl(var(--primary)/0.4)] transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/20 to-transparent rounded-bl-full" />
            <CardHeader className="text-center pb-8 pt-8 relative">
              <Badge className="mb-4 mx-auto bg-primary text-primary-foreground w-fit">
                OFERTA ESPECIAL
              </Badge>
              <h3 className="text-2xl md:text-3xl font-bold mb-2">Planilhas 6k Pro</h3>
              <p className="text-muted-foreground mb-6">6.000 Planilhas Excel Profissionais</p>
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
                onClick={() => navigate('/checkout')}
              >
                Quero Começar Agora
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Offers;
