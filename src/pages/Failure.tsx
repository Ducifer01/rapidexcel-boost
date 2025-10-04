import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { XCircle, ArrowLeft } from "lucide-react";

const Failure = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <Card className="max-w-2xl w-full">
        <CardContent className="pt-12 pb-8 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <XCircle className="w-12 h-12 text-destructive" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold">Pagamento Não Aprovado</h1>
            <p className="text-xl text-muted-foreground">
              Não foi possível processar seu pagamento
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-6 space-y-3 text-left">
            <h3 className="font-bold">Possíveis motivos:</h3>
            <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
              <li>Saldo insuficiente ou limite do cartão atingido</li>
              <li>Dados do cartão incorretos ou vencido</li>
              <li>Transação recusada pela operadora</li>
              <li>Problemas temporários de conexão</li>
            </ul>
          </div>

          <div className="space-y-3 pt-4">
            <Link to="/checkout">
              <Button 
                size="lg" 
                className="w-full bg-gradient-to-r from-primary to-primary-glow"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Tentar Novamente
              </Button>
            </Link>
            
            <Link to="/">
              <Button variant="outline" size="lg" className="w-full">
                Voltar ao Início
              </Button>
            </Link>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <p className="text-sm text-yellow-700 dark:text-yellow-500">
              <strong>Dica:</strong> Verifique os dados do pagamento ou tente outro método. 
              Se o problema persistir, entre em contato com seu banco.
            </p>
          </div>

          <p className="text-xs text-muted-foreground">
            Precisa de ajuda? Entre em contato via Instagram{" "}
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

export default Failure;
