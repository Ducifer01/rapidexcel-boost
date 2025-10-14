import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Check,
  Gift,
  FileSpreadsheet,
  FileText,
  Presentation,
  Star,
  DollarSign,
  TrendingUp,
  Home,
  Target,
  FileCheck,
  CreditCard,
  BookOpen,
  BarChart,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

const Offers = () => {
  const navigate = useNavigate();

  const bonusList = [
    {
      icon: <Presentation className="w-6 h-6 text-blue-500" />,
      title: "Bônus 01:",
      description: "5.000 Modelos de apresentações no Power Point",
    },
    {
      icon: <FileText className="w-6 h-6 text-blue-500" />,
      title: "Bônus 02:",
      description: "4.000 modelos de documentos editáveis no Word",
    },
    {
      icon: <BarChart className="w-6 h-6 text-blue-500" />,
      title: "Bônus 03:",
      description: "800 templates em POWER BI",
    },
    {
      icon: <DollarSign className="w-6 h-6 text-blue-500" />,
      title: "Bônus 04:",
      description: "Acabe com as suas Dívidas! Receba Planilhas para controle financeiro pessoal",
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-blue-500" />,
      title: "Bônus 05:",
      description: "Do zero ao investidor: Guia para aprender investir seu dinheiro",
    },
    {
      icon: <Home className="w-6 h-6 text-blue-500" />,
      title: "Bônus 06:",
      description: "Simulador de casa própria",
    },
    {
      icon: <Target className="w-6 h-6 text-blue-500" />,
      title: "Bônus 07:",
      description: "Planejador de carreira e metas pessoais",
    },
    {
      icon: <FileCheck className="w-6 h-6 text-blue-500" />,
      title: "Bônus 08:",
      description: "Manual para limpar seu nome no SERASA",
    },
    {
      icon: <CreditCard className="w-6 h-6 text-blue-500" />,
      title: "Bônus 09:",
      description: "Guia: Aumente seu score e volte a ter crédito com hábitos financeiros responsáveis",
    },
    {
      icon: <BookOpen className="w-6 h-6 text-blue-500" />,
      title: "Bônus 10:",
      description: "E-BOOK: Estratégias para quitar suas dívidas mesmo ganhando pouco",
    },
  ];

  return (
    <section id="ofertas" className="py-16 md:py-24 px-4 bg-gradient-to-b from-muted/30 to-background">
      <div className="container max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-16 space-y-4">
          <Badge className="mb-4 bg-secondary text-secondary-foreground px-4 py-2 text-sm">🔥 OFERTA LIMITADA</Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
            Escolha o Pacote Perfeito{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-secondary-glow">
              Para Você!
            </span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Investimento único para acesso vitalício - Sem mensalidades
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Pack 1 - Excel Completo Pro */}
          <Card className="border-4 border-green-500 hover:shadow-[0_12px_40px_-8px_rgba(34,197,94,0.4)] transition-all duration-300 relative overflow-hidden bg-white dark:bg-card">
            <CardHeader className="text-center pb-8 pt-6 relative">
              {/* 5 Estrelas */}
              <div className="flex gap-1 justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-10 h-10 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Badge MAIS VENDIDO - Vermelho Grande */}
              <Badge className="mb-4 mx-auto bg-gradient-to-r from-red-600 to-red-500 text-white w-fit text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3 animate-pulse shadow-lg">
                PLANO PREMIUM (MAIS VENDIDO)
              </Badge>

              {/* Mockup do Produto */}
              <div className="relative w-full h-32 sm:h-40 mb-4 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-xl flex items-center justify-center border-2 border-green-200 dark:border-green-800">
                <FileSpreadsheet className="w-20 h-20 sm:w-28 sm:h-28 text-green-500 opacity-60" />
              </div>

              <div className="flex items-center justify-center gap-3 mb-2">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">Pack Excel Completo Pro</h3>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground mb-4">13.000 Planilhas Excel Profissionais</p>
              <div className="space-y-1">
                <p className="text-xs sm:text-sm text-muted-foreground line-through">De R$ 1.997,00</p>
                <p className="text-4xl sm:text-5xl md:text-6xl font-bold" style={{ color: "#22C55E" }}>
                  R$ 12,99
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  pagamento único •{" "}
                  <span className="font-bold" style={{ color: "#22C55E" }}>
                    93% OFF
                  </span>
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pb-6">
              {/* Benefícios Principais - Checkmarks Verdes */}
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 mt-0.5" style={{ color: "#22C55E" }} />
                  <span className="text-xs sm:text-sm md:text-base">
                    <strong className="font-bold">13.000+ Planilhas Excel</strong> profissionais editáveis
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 mt-0.5" style={{ color: "#22C55E" }} />
                  <span className="text-xs sm:text-sm md:text-base">
                    <strong className="font-bold">+50 Dashboards</strong> extras premium
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 mt-0.5" style={{ color: "#22C55E" }} />
                  <span className="text-xs sm:text-sm md:text-base">
                    Todas as categorias: <strong>Finanças, RH, Vendas, Engenharia, Logística, Pessoal</strong> e mais
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 mt-0.5" style={{ color: "#22C55E" }} />
                  <span className="text-xs sm:text-sm md:text-base">Acesso imediato após pagamento</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 mt-0.5" style={{ color: "#22C55E" }} />
                  <span className="text-xs sm:text-sm md:text-base">Acesso vitalício sem renovação</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 mt-0.5" style={{ color: "#22C55E" }} />
                  <span className="text-xs sm:text-sm md:text-base">Garantia de 7 dias</span>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full text-base sm:text-lg py-5 sm:py-6 shadow-lg hover:shadow-xl transition-all duration-300"
                style={{
                  background: "linear-gradient(135deg, #22C55E, #16A34A)",
                  color: "white",
                }}
                onClick={() => navigate("/checkout")}
              >
                Começar Agora - R$ 12,99
              </Button>
              <p className="text-[10px] sm:text-xs text-center text-muted-foreground">⚡ Economize mais de 200 horas de trabalho</p>
            </CardContent>
          </Card>

          {/* Pack 2 - Office Premium */}
          <Card className="border-4 border-blue-500 hover:shadow-[0_12px_40px_-8px_rgba(59,130,246,0.4)] transition-all duration-300 relative overflow-hidden bg-gradient-to-br from-blue-500/5 to-transparent">
            <CardHeader className="text-center pb-8 pt-6 relative">
              {/* 5 Estrelas */}
              <div className="flex gap-1 justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-10 h-10 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Badge PACOTE PREMIUM - Vermelho Grande */}
              <Badge className="mb-4 mx-auto bg-gradient-to-r from-red-600 to-red-500 text-white w-fit text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3 animate-pulse shadow-lg">
                <Gift className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                PACOTE PREMIUM COMPLETO
              </Badge>

              {/* Mockup do Produto */}
              <div className="relative w-full h-32 sm:h-40 mb-4 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl flex items-center justify-center border-2 border-blue-200 dark:border-blue-800">
                <div className="flex -space-x-4">
                  <FileText className="w-16 h-16 sm:w-20 sm:h-20 text-blue-500 opacity-60" />
                  <Presentation className="w-16 h-16 sm:w-20 sm:h-20 text-blue-500 opacity-60" />
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 mb-2">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">Pack Office Premium</h3>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground mb-4">Templates Word + Slides PowerPoint + Bônus</p>
              <div className="space-y-1">
                <p className="text-xs sm:text-sm text-muted-foreground line-through">De R$ 3.997,00</p>
                <p className="text-4xl sm:text-5xl md:text-6xl font-bold" style={{ color: "#3B82F6" }}>
                  R$ 29,99
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  pagamento único •{" "}
                  <span className="font-bold" style={{ color: "#3B82F6" }}>
                    94% OFF
                  </span>
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pb-6">
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg mb-3">
                <p className="text-xs sm:text-sm font-bold text-amber-600 text-center">
                  💎 UPGRADE COMPLETO: Tudo do Pack 1 + Muito Mais!
                </p>
              </div>

              {/* Benefícios Principais - Checkmarks Azuis */}
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 mt-0.5" style={{ color: "#3B82F6" }} />
                  <span className="text-xs sm:text-sm md:text-base">
                    <strong className="font-bold">✅ TUDO do Pack Excel</strong> + (13.000 planilhas + dashboards)
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 mt-0.5" style={{ color: "#3B82F6" }} />
                  <span className="text-xs sm:text-sm md:text-base">
                    <strong className="font-bold">+2.000 Templates Word</strong> profissionais (contratos, propostas,
                    relatórios)
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 mt-0.5" style={{ color: "#3B82F6" }} />
                  <span className="text-xs sm:text-sm md:text-base">
                    <strong className="font-bold">+50.000 Slides PowerPoint</strong> para apresentações impactantes
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 mt-0.5" style={{ color: "#3B82F6" }} />
                  <span className="text-xs sm:text-sm md:text-base">
                    <strong className="font-bold">+6.000 planilhas Excel extras exclusivas</strong>
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 mt-0.5" style={{ color: "#3B82F6" }} />
                  <span className="text-xs sm:text-sm md:text-base">Acesso vitalício a TUDO</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 mt-0.5" style={{ color: "#3B82F6" }} />
                  <span className="text-xs sm:text-sm md:text-base">Suporte prioritário</span>
                </div>
              </div>

              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-xs sm:text-sm font-bold text-center">
                  💰 Economia Total:{" "}
                  <span className="text-lg sm:text-xl" style={{ color: "#3B82F6" }}>
                    R$ 3.967
                  </span>
                </p>
                <p className="text-[10px] sm:text-xs text-center text-muted-foreground mt-1">
                  Mais de 60.000 arquivos por menos de R$ 0,001 cada!
                </p>
              </div>
              <Button
                size="lg"
                className="w-full text-base sm:text-lg py-5 sm:py-6 shadow-lg hover:shadow-xl transition-all duration-300"
                style={{
                  background: "linear-gradient(135deg, #3B82F6, #2563EB)",
                  color: "white",
                }}
                onClick={() => navigate("/checkout")}
              >
                Quero o Pacote Completo - R$ 29,99
              </Button>
              <p className="text-[10px] sm:text-xs text-center text-muted-foreground">
                ⚡ Melhor custo-benefício: Mais de 60.000 arquivos!
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Garantia */}
        <div className="mt-8 sm:mt-12 text-center max-w-3xl mx-auto">
          <div className="p-4 sm:p-6 bg-primary/10 border-2 border-primary/30 rounded-2xl">
            <p className="text-base sm:text-lg font-bold mb-2">🛡️ Garantia de 7 Dias</p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Se você não ficar completamente satisfeito, devolvemos 100% do seu dinheiro. Sem perguntas, sem
              burocracia.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Offers;
