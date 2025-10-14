import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, CheckCircle, X } from 'lucide-react';
import { getProductById } from '@/lib/products';

interface UpsellModalProps {
  open: boolean;
  onClose: () => void;
  onAccept: () => void;
  onDecline: () => void;
}

export const UpsellModal = ({ open, onClose, onAccept, onDecline }: UpsellModalProps) => {
  const pack2 = getProductById('pack_2');

  if (!pack2) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl p-0 overflow-hidden max-h-[95vh] overflow-y-auto">
        {/* Header com destaque - Mobile First */}
        <div className="bg-gradient-to-r from-primary to-primary-glow p-4 sm:p-6 text-primary-foreground sticky top-0 z-10">
          <button 
            onClick={onDecline}
            className="absolute top-2 right-2 sm:top-4 sm:right-4 text-primary-foreground/80 hover:text-primary-foreground transition-colors p-2"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
            <Badge className="bg-white/20 text-white border-none text-xs">
              OFERTA ESPECIAL
            </Badge>
          </div>
          <DialogTitle className="text-xl sm:text-2xl md:text-3xl font-black mb-2 pr-8">
            🎉 Espere! Não Perca Esta Oportunidade!
          </DialogTitle>
          <DialogDescription className="text-primary-foreground/90 text-sm sm:text-base">
            Adicione agora e economize <span className="font-bold text-lg sm:text-xl">R$ {pack2.savings?.toFixed(2)}</span>
          </DialogDescription>
        </div>

        {/* Conteúdo - Mobile Optimized */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Benefícios */}
          <div className="space-y-3">
            <h3 className="font-bold text-base sm:text-lg">Por que adicionar agora?</h3>
            
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-start gap-2 sm:gap-3 p-3 bg-primary/5 rounded-lg">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="font-semibold text-sm sm:text-base leading-tight">+2.000 Templates Word</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Contratos, relatórios, currículos</p>
                </div>
              </div>

              <div className="flex items-start gap-2 sm:gap-3 p-3 bg-primary/5 rounded-lg">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="font-semibold text-sm sm:text-base leading-tight">+50.000 Slides PowerPoint</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Apresentações premium</p>
                </div>
              </div>

              <div className="flex items-start gap-2 sm:gap-3 p-3 bg-primary/5 rounded-lg">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="font-semibold text-sm sm:text-base leading-tight">BÔNUS: +6.000 Excel Extras</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Ferramentas para seu negócio</p>
                </div>
              </div>
            </div>
          </div>

          {/* Preço e Economia - Mobile First */}
          <div className="bg-gradient-to-br from-primary/10 to-transparent border-2 border-primary/30 rounded-lg p-3 sm:p-4">
            <div className="text-center space-y-2">
              <p className="text-xs sm:text-sm text-muted-foreground line-through">
                De R$ {pack2.originalPrice?.toFixed(2)}
              </p>
              <div className="flex items-center justify-center gap-2">
                <p className="text-2xl sm:text-3xl font-black text-primary">
                  +R$ {pack2.price.toFixed(2)}
                </p>
                <div className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-bold">
                  99% OFF
                </div>
              </div>
              <div className="flex items-center justify-center gap-1 text-primary">
                <TrendingUp className="w-5 h-5" />
                <p className="text-xs sm:text-sm font-semibold">
                  Economize R$ {pack2.savings?.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* CTAs - Mobile Optimized */}
          <div className="space-y-2 sm:space-y-3">
            <Button
              onClick={onAccept}
              className="w-full h-14 sm:h-16 text-base sm:text-lg bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary font-bold"
              size="lg"
            >
              <Sparkles className="mr-2 w-5 h-5" />
              <span className="leading-tight">Sim! Quero Adicionar</span>
            </Button>
            
            <Button
              onClick={onDecline}
              variant="ghost"
              className="w-full h-12 text-sm text-muted-foreground hover:text-foreground"
            >
              Continuar sem upgrade
            </Button>
          </div>

          {/* Garantia */}
          <div className="text-center pt-3 sm:pt-4 border-t space-y-1">
            <p className="text-xs text-muted-foreground">
              🔒 Compra 100% segura
            </p>
            <p className="text-xs text-muted-foreground">
              ✓ Acesso imediato • ⚡ Download ilimitado
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
