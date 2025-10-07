import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ArrowRight, Info } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Success = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Redirecionar usuários autenticados para o Dashboard
    if (!loading && user) {
      navigate("/dashboard");
      return;
    }

    // Opcional: enviar evento de conversão para analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'purchase', {
        transaction_id: new URLSearchParams(window.location.search).get('payment_id'),
        value: 25.98,
        currency: 'BRL',
      });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-950 p-4">
      <Card className="max-w-md w-full border-2 border-green-500/20 shadow-2xl">
        <CardContent className="pt-8 pb-6 text-center">
          <div className="mb-6 flex justify-center">
            <div className="p-4 bg-green-100 dark:bg-green-900 rounded-full">
              <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-green-900 dark:text-green-100 mb-4">
            Pagamento Aprovado!
          </h1>
          
          <p className="text-green-700 dark:text-green-300 mb-6 text-lg">
            Seu pagamento foi processado com sucesso! 🎉
          </p>
          
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3 text-left">
              <Info className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-green-800 dark:text-green-200 font-semibold mb-2">
                  Sua conta foi criada automaticamente!
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Use o <strong>email e senha</strong> que você cadastrou no checkout para fazer login e acessar suas planilhas.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={() => navigate("/login")}
              className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white h-12 text-lg"
              size="lg"
            >
              Fazer Login Agora
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            
            <Button 
              onClick={() => navigate("/")}
              variant="outline"
              className="w-full"
            >
              Voltar ao Início
            </Button>
          </div>

          <p className="text-xs text-green-700 dark:text-green-400 mt-6">
            Problemas com o acesso? Utilize o chat de suporte ou entre em contato via Instagram{" "}
            <a 
              href="https://instagram.com/planilhaexpress_ofc" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-green-600 dark:text-green-400 hover:underline font-semibold"
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
