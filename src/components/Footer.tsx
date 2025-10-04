import { Shield, Mail, Clock } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-12 px-4">
      <div className="container max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="space-y-4 text-center md:text-left">
            <Shield className="w-8 h-8 mx-auto md:mx-0 text-primary" />
            <h3 className="font-bold text-lg">Pagamento Seguro</h3>
            <p className="text-sm text-background/80">
              Transações protegidas com certificação SSL e criptografia de dados
            </p>
          </div>
          
          <div className="space-y-4 text-center">
            <Clock className="w-8 h-8 mx-auto text-primary" />
            <h3 className="font-bold text-lg">Acesso Imediato</h3>
            <p className="text-sm text-background/80">
              Receba seu acesso automaticamente após a confirmação do pagamento
            </p>
          </div>
          
          <div className="space-y-4 text-center md:text-right">
            <Mail className="w-8 h-8 mx-auto md:ml-auto text-primary" />
            <h3 className="font-bold text-lg">Suporte Dedicado</h3>
            <p className="text-sm text-background/80">
              Equipe pronta para ajudar você com qualquer dúvida
            </p>
          </div>
        </div>

        <div className="border-t border-background/20 pt-8 text-center space-y-4">
          <p className="text-sm text-background/80">
            © 2024 Planilhas Excel Premium. Todos os direitos reservados.
          </p>
          <p className="text-xs text-background/60">
            Este site não faz parte do site do Facebook ou Facebook Inc. Além disso, este site NÃO é endossado pelo Facebook de forma alguma. FACEBOOK é uma marca comercial da FACEBOOK, Inc.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
