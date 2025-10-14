import { Lock, Shield, CheckCircle2 } from 'lucide-react';

export const TrustBadges = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Lock className="h-4 w-4 text-primary" />
        <span>Compra 100% Segura</span>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Shield className="h-4 w-4 text-primary" />
        <span>Garantia 7 Dias</span>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <CheckCircle2 className="h-4 w-4 text-primary" />
        <span>SSL Certificado</span>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <img src="https://http2.mlstatic.com/storage/logos-api-admin/a5f047d0-9be0-11ec-aad4-c3381f368aaf-m.svg" alt="Mercado Pago" className="h-5" />
        <span>Mercado Pago</span>
      </div>
    </div>
  );
};
