import { Button } from "@/components/ui/button";
import { ShoppingCart, Check, LogIn } from "lucide-react";
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
          {/* Badge de destaque */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary">
            <Check className="w-4 h-4" />
            <span>Acesso Imediato e Vitalício</span>
          </div>

          {/* Headline principal */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
            Otimize sua Gestão e <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-glow">
              Produtividade
            </span>
          </h1>

          {/* Sub-headline */}
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Tenha Acesso Imediato a <span className="font-bold text-foreground">6.000 Planilhas Excel</span> por Apenas{" "}
            <span className="font-bold text-secondary">R$ 12,99!</span>
          </p>

          {/* Descrição adicional */}
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Soluções completas para finanças, administração, RH, logística e muito mais. 
            <span className="font-semibold text-foreground"> Totalmente editáveis</span> e prontas para usar.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button 
              size="lg" 
              onClick={scrollToOffer}
              className="w-full sm:w-auto bg-gradient-to-r from-secondary to-secondary-glow hover:opacity-90 text-base sm:text-lg px-8 py-6 shadow-[0_10px_40px_-10px_hsl(var(--secondary)/0.5)] hover:shadow-[0_15px_50px_-10px_hsl(var(--secondary)/0.6)] transition-all duration-300 transform hover:scale-105"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Quero Minhas 6.000 Planilhas Agora!
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

          {/* Elementos de confiança */}
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
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
