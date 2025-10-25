import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useFacebookPixel } from "@/hooks/useFacebookPixel";

const Success = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [loggingIn, setLoggingIn] = useState(false);
  const { trackEvent } = useFacebookPixel();

  useEffect(() => {
    const handleAutoLogin = async () => {
      try {
        // Verificar se há tokens pendentes do processo de checkout
        const pendingTokens = localStorage.getItem('pending_auth_tokens');
        
        if (pendingTokens) {
          const tokens = JSON.parse(pendingTokens);
          setLoggingIn(true);
          
          // Fazer login com os tokens
          const { data, error } = await supabase.auth.setSession({
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
          });

          if (error) {
            console.error('Erro ao fazer login automático:', error);
            toast.error('Erro ao fazer login automático. Você pode fazer login manualmente.');
          } else if (data.session) {
            // Limpar tokens pendentes
            localStorage.removeItem('pending_auth_tokens');
            
            // Redirecionar para dashboard após 2 segundos
            setTimeout(() => {
              navigate('/dashboard');
            }, 2000);
          }
        }

        // Recuperar dados da compra do localStorage
        const purchaseData = localStorage.getItem('checkout_purchase_data');
        let totalValue = 12.99;
        let productIds = ['pack_1'];
        
        if (purchaseData) {
          const parsedData = JSON.parse(purchaseData);
          totalValue = parsedData.total || 12.99;
          productIds = parsedData.products || ['pack_1'];
          localStorage.removeItem('checkout_purchase_data');
        }

        // Advanced Matching: informar email ao Pixel, se disponível
        try {
          const userDataStr = localStorage.getItem('checkout_user_data');
          if (userDataStr && typeof window !== 'undefined' && (window as any).fbq) {
            const userData = JSON.parse(userDataStr);
            if (userData?.email) {
              (window as any).fbq('init', '2708262289551049', {
                em: userData.email,
                external_id: userData.email,
              });
            }
          }
        } catch (_) {}

        // Facebook Pixel: Purchase (conversão finalizada)
        trackEvent('Purchase', {
          content_ids: productIds,
          content_name: 'Pack Office Purchase',
          content_type: 'product',
          value: totalValue,
          currency: 'BRL',
          num_items: productIds.length,
          transaction_id: new Date().getTime().toString(),
          predicted_ltv: totalValue * 3
        });
        
        // Limpar dados sensíveis do checkout
        localStorage.removeItem('checkout_user_data');

        // Enviar evento de conversão para o Google Analytics se disponível
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'purchase', {
            transaction_id: new Date().getTime().toString(),
            value: totalValue,
            currency: 'BRL',
          });
        }
      } catch (error) {
        console.error('Erro no processo de login:', error);
      } finally {
        setLoading(false);
      }
    };

    handleAutoLogin();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Processando seu pagamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-green-50 to-white">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-scale-in">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Pagamento Confirmado!</CardTitle>
          <CardDescription>
            {loggingIn 
              ? "Redirecionando para seu painel..."
              : "Sua compra foi processada com sucesso"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loggingIn ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
              <p className="text-sm text-muted-foreground">
                Preparando seu acesso...
              </p>
            </div>
          ) : (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold mb-2">✨ Acesse sua Área de Membros:</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Clique em "Acessar Painel" abaixo</li>
                  <li>Use o email e senha que você cadastrou</li>
                  <li>Baixe todas as suas planilhas imediatamente</li>
                </ol>
              </div>

              <div className="flex flex-col gap-2">
                <Button 
                  onClick={() => navigate('/login')}
                  className="w-full h-12"
                  size="lg"
                >
                  Acessar Painel Agora
                </Button>
                <Button 
                  onClick={() => navigate('/')}
                  variant="outline"
                  className="w-full"
                >
                  Voltar ao Início
                </Button>
              </div>

              <p className="text-sm text-center text-muted-foreground">
                Precisa de ajuda? Entre em contato pelo nosso{" "}
                <a 
                  href="https://www.instagram.com/planilhaexpress/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Instagram
                </a>
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Success;
