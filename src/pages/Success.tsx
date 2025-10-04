import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Mail, Download } from "lucide-react";

const Success = () => {
  useEffect(() => {
    // Opcional: enviar evento de conversão para analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'purchase', {
        transaction_id: new URLSearchParams(window.location.search).get('payment_id'),
        value: 25.98,
        currency: 'BRL',
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <Card className="max-w-2xl w-full">
        <CardContent className="pt-12 pb-8 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <CheckCircle className="w-12 h-12 text-primary" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold">Pagamento Aprovado!</h1>
            <p className="text-xl text-muted-foreground">
              Sua compra foi processada com sucesso! 🎉
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-6 space-y-4">
            <div className="flex items-start gap-3 text-left">
              <Mail className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-bold mb-1">E-mail de Acesso Enviado</h3>
                <p className="text-sm text-muted-foreground">
                  Enviamos um e-mail com suas credenciais e link para download. 
                  Verifique sua caixa de entrada e spam.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 text-left">
              <Download className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-bold mb-1">Acesso Imediato</h3>
                <p className="text-sm text-muted-foreground">
                  Você já pode acessar todo o conteúdo da sua compra através 
                  do link enviado por e-mail.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <Button 
              size="lg" 
              className="w-full bg-gradient-to-r from-primary to-primary-glow"
              asChild
            >
              <a href="mailto:">Abrir E-mail</a>
            </Button>
            
            <Link to="/">
              <Button variant="outline" size="lg" className="w-full">
                Voltar ao Início
              </Button>
            </Link>
          </div>

          <p className="text-xs text-muted-foreground">
            Problemas com o acesso? Entre em contato via Instagram{" "}
            <a 
              href="https://instagram.com/planilhaexpress_ofc" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              @planilhaexpress_ofc
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Success;
