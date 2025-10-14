import { Lock, Shield, CheckCircle2 } from 'lucide-react';

export const TrustBadges = () => {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
      <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-muted-foreground">
        <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
        <span>Compra Segura</span>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-muted-foreground">
        <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
        <span>Garantia 7 Dias</span>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-muted-foreground">
        <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
        <span>SSL Certificado</span>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-muted-foreground">
        <img src="https://http2.mlstatic.com/storage/logos-api-admin/a5f047d0-9be0-11ec-aad4-c3381f368aaf-m.svg" alt="Mercado Pago" className="h-4 sm:h-5" />
        <span>Mercado Pago</span>
      </div>
    </div>
  );
};
