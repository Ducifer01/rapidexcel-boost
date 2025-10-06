import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ArrowRight, Info, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Success = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [verifying, setVerifying] = useState(true);
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      // Pegar session_id da URL
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get('session_id');

      if (!sessionId) {
        toast({
          title: "Erro",
          description: "ID da sessão não encontrado",
          variant: "destructive",
        });
        setVerifying(false);
        return;
      }

      try {
        // Verificar pagamento no Stripe
        const { data, error } = await supabase.functions.invoke('verify-stripe-payment', {
          body: { session_id: sessionId },
        });

        if (error) throw error;

        console.log('Verificação de pagamento:', data);

        // Se o usuário foi criado, pegar credenciais do sessionStorage
        if (data.user_created) {
          const checkoutData = sessionStorage.getItem('checkout_data');
          if (checkoutData) {
            const parsed = JSON.parse(checkoutData);
            setCredentials({
              email: parsed.email,
              password: parsed.password || data.temp_password,
            });
            sessionStorage.removeItem('checkout_data');
          }
        }

        // Enviar evento para analytics
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'purchase', {
            transaction_id: sessionId,
            value: 25.98,
            currency: 'BRL',
          });
        }

      } catch (error) {
        console.error('Erro ao verificar pagamento:', error);
        toast({
          title: "Erro na verificação",
          description: "Não foi possível verificar o pagamento. Tente fazer login.",
          variant: "destructive",
        });
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [toast]);

  if (verifying) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-950 p-4">
        <Loader2 className="w-12 h-12 animate-spin text-green-600 mb-4" />
        <p className="text-green-700 dark:text-green-300">Verificando seu pagamento...</p>
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
                  Use o <strong>email{credentials ? ` (${credentials.email})` : ""}</strong> e <strong>senha</strong> que você cadastrou no checkout para fazer login e acessar suas planilhas.
                </p>
                {credentials && (
                  <div className="mt-3 p-3 bg-green-100 dark:bg-green-800/50 rounded border border-green-300 dark:border-green-700">
                    <p className="text-xs text-green-800 dark:text-green-200 font-mono break-all">
                      <strong>Email:</strong> {credentials.email}
                      <br />
                      <strong>Senha:</strong> {credentials.password}
                    </p>
                  </div>
                )}
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
            Problemas com o acesso? Entre em contato via Instagram{" "}
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
