import { Button } from "@/components/ui/button";
import { ShoppingCart, Check, LogIn, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();
  
  const scrollToOffer = () => {
    document.getElementById('ofertas')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center px-4 py-12 md:py-20 bg-gradient-to-b from-primary/5 to-background overflow-hidden">
      {/* Elementos decorativos de fundo */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
      
      {/* Botão de Área de Membros no canto superior direito */}
      <div className="absolute top-4 right-4 z-20">
        <Button
          onClick={() => navigate('/login')}
          variant="outline"
          className="border-primary/30 hover:bg-primary/10 hover:border-primary/50"
        >
          <LogIn className="w-4 h-4 mr-2" />
          Área de Membros
        </Button>
      </div>
      
      <div className="container max-w-6xl mx-auto relative z-10">
        <div className="text-center space-y-6 md:space-y-8 animate-fade-in">
          {/* Badge de urgência */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 border border-destructive/30 text-sm font-bold text-destructive animate-pulse">
            <AlertTriangle className="w-4 h-4" />
            <span>Oferta de Lançamento - 93% OFF</span>
          </div>

          {/* Headline principal focada em DOR */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
            ❌ Pare de Perder Tempo <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-destructive to-orange-500">
              Criando Arquivos do Zero
            </span>
          </h1>

          {/* Sub-headline com solução */}
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            ✅ Tenha Acesso IMEDIATO a{" "}
            <span className="font-bold text-foreground">60.000+ Arquivos Profissionais</span>{" "}
            por Apenas <span className="font-bold text-primary text-3xl">R$ 12,99!</span>
          </p>

          {/* Descrição de valor */}
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto">
            📊 <span className="font-semibold text-foreground">13.000 Planilhas Excel</span> +{" "}
            <span className="font-semibold text-foreground">2.000 Templates Word</span> +{" "}
            <span className="font-semibold text-foreground">50.000 Slides PowerPoint</span>
            <br />
            <span className="text-sm mt-2 block">
              Soluções completas para{" "}
              <span className="font-semibold text-foreground">
                estudantes, empreendedores, freelancers, empresários
              </span>{" "}
              e muito mais!
            </span>
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button 
              size="lg" 
              onClick={scrollToOffer}
              className="w-full sm:w-auto bg-gradient-to-r from-secondary to-secondary-glow hover:opacity-90 text-base sm:text-lg px-8 py-6 shadow-[0_10px_40px_-10px_hsl(var(--secondary)/0.5)] hover:shadow-[0_15px_50px_-10px_hsl(var(--secondary)/0.6)] transition-all duration-300 transform hover:scale-105"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Quero Economizar 200+ Horas Agora!
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              onClick={scrollToOffer}
              className="w-full sm:w-auto text-base sm:text-lg px-8 py-6 border-2 hover:bg-primary/5"
            >
              Ver Detalhes da Oferta
            </Button>
          </div>

          {/* Elementos de confiança e prova social */}
          <div className="flex flex-wrap justify-center gap-6 pt-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              <span>Pagamento 100% Seguro</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              <span>Garantia de 7 Dias</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              <span>Acesso Vitalício</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              <span>+2.847 Pessoas Já Garantiram</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
