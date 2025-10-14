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
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        {/* Header com destaque */}
        <div className="bg-gradient-to-r from-primary to-primary-glow p-6 text-primary-foreground">
          <button 
            onClick={onDecline}
            className="absolute top-4 right-4 text-primary-foreground/80 hover:text-primary-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-6 h-6" />
            <Badge className="bg-white/20 text-white border-none">
              OFERTA ESPECIAL
            </Badge>
          </div>
          <DialogTitle className="text-2xl md:text-3xl font-black mb-2">
            🎉 Espere! Não Perca Esta Oportunidade!
          </DialogTitle>
          <DialogDescription className="text-primary-foreground/90 text-base">
            Adicione o pacote completo agora e economize <span className="font-bold text-xl">R$ {pack2.savings?.toFixed(2)}</span>
          </DialogDescription>
        </div>

        {/* Conteúdo */}
        <div className="p-6 space-y-6">
          {/* Benefícios */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Por que adicionar agora?</h3>
            
            <div className="grid gap-3">
              <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">+2.000 Templates Word Profissionais</p>
                  <p className="text-xs text-muted-foreground">Contratos, relatórios, currículos e muito mais</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">+50.000 Slides PowerPoint Premium</p>
                  <p className="text-xs text-muted-foreground">Apresentações prontas para impressionar</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">BÔNUS: +6.000 Planilhas Excel Extras</p>
                  <p className="text-xs text-muted-foreground">Ainda mais ferramentas para seu negócio</p>
                </div>
              </div>
            </div>
          </div>

          {/* Preço e Economia */}
          <div className="bg-gradient-to-br from-primary/10 to-transparent border-2 border-primary/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm text-muted-foreground line-through">
                  De R$ {pack2.originalPrice?.toFixed(2)}
                </p>
                <p className="text-3xl font-black text-primary">
                  Por apenas +R$ {pack2.price.toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold">
                  99% OFF
                </div>
                <TrendingUp className="w-8 h-8 text-primary mx-auto mt-2" />
              </div>
            </div>
            <p className="text-xs text-center font-semibold text-primary">
              🔥 Economize R$ {pack2.savings?.toFixed(2)} adicionando AGORA
            </p>
          </div>

          {/* CTAs */}
          <div className="space-y-3">
            <Button
              onClick={onAccept}
              className="w-full h-14 text-lg bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary"
              size="lg"
            >
              <Sparkles className="mr-2 w-5 h-5" />
              Sim! Quero Adicionar e Economizar
            </Button>
            
            <Button
              onClick={onDecline}
              variant="ghost"
              className="w-full text-muted-foreground hover:text-foreground"
            >
              Não, obrigado. Continuar sem o upgrade
            </Button>
          </div>

          {/* Garantia */}
          <div className="text-center pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              🔒 Compra 100% segura • ✓ Acesso imediato após pagamento • ⚡ Download ilimitado
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
