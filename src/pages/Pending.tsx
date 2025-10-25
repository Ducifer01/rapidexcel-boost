import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Mail } from "lucide-react";
import { useFacebookPixel } from "@/hooks/useFacebookPixel";

const Pending = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { trackEvent } = useFacebookPixel();

  // Se o Mercado Pago retornar "approved" por querystring, redireciona para /success
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = (params.get('status') || params.get('collection_status') || '').toLowerCase();
    if (status === 'approved' || status === 'success' || status === 'approved_payment') {
      navigate(`/success${location.search}`, { replace: true });
    }
  }, [location.search, navigate]);

  // Facebook Pixel: Purchase na tela Pending
  useEffect(() => {
    try {
      const purchaseDataStr = localStorage.getItem('checkout_purchase_data');
      if (purchaseDataStr) {
        const purchaseData = JSON.parse(purchaseDataStr);
        const productIds = purchaseData.products || [];
        const totalValue = purchaseData.total || 0;

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
          content_name: 'Planilhas Excel Pro',
          content_type: 'product',
          value: totalValue,
          currency: 'BRL',
          transaction_id: new Date().getTime().toString(),
          predicted_ltv: totalValue * 3
        });
        
        // Limpar dados sensíveis do checkout
        localStorage.removeItem('checkout_user_data');
        localStorage.removeItem('checkout_purchase_data');
      }
    } catch (error) {
      console.error('Erro ao processar evento Purchase:', error);
    }
  }, [trackEvent]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <Card className="max-w-2xl w-full">
        <CardContent className="pt-12 pb-8 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto">
            <Clock className="w-12 h-12 text-yellow-600" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold">Pagamento Pendente</h1>
            <p className="text-xl text-muted-foreground">
              Seu pagamento está sendo processado
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-6 space-y-4 text-left">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-bold mb-1">Aguardando Confirmação</h3>
                <p className="text-sm text-muted-foreground">
                  Seu pagamento está sendo processado pela instituição financeira. 
                  Isso pode levar alguns minutos ou até 2 dias úteis dependendo do 
                  método de pagamento escolhido.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-bold mb-1">Notificação por E-mail</h3>
                <p className="text-sm text-muted-foreground">
                  Assim que o pagamento for confirmado, você receberá um e-mail 
                  com suas credenciais e link para acesso aos produtos.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <Link to="/">
              <Button size="lg" className="w-full">
                Voltar ao Início
              </Button>
            </Link>
          </div>

          <p className="text-xs text-muted-foreground">
            Dúvidas? Entre em contato via Instagram{" "}
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

export default Pending;
