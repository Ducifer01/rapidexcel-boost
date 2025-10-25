import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Mail } from "lucide-react";
import { useFacebookPixel } from "@/hooks/useFacebookPixel";
import { supabase } from "@/integrations/supabase/client";

const Pending = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { trackEvent, isEnabled } = useFacebookPixel();

  // Se o Mercado Pago retornar "approved" por querystring, redireciona para /success
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = (params.get('status') || params.get('collection_status') || '').toLowerCase();
    if (status === 'approved' || status === 'success' || status === 'approved_payment') {
      navigate(`/success${location.search}`, { replace: true });
    }
  }, [location.search, navigate]);

  // Garantir autenticação (usando tokens pendentes) ao entrar no Pending
  useEffect(() => {
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          const tokensStr = localStorage.getItem('pending_auth_tokens');
          if (tokensStr) {
            const tokens = JSON.parse(tokensStr);
            await supabase.auth.setSession({
              access_token: tokens.access_token,
              refresh_token: tokens.refresh_token,
            });
          }
        }
      } catch (e) {
        console.error('Erro ao garantir sessão no Pending:', e);
      }
    })();
  }, []);

  // Polling de status no banco usando external_reference
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const externalRef = params.get('external_reference');
    if (!externalRef) return;

    let interval: number | undefined;
    const checkStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('purchases')
          .select('payment_status')
          .eq('id', externalRef)
          .single();
        if (!error && data?.payment_status === 'approved') {
          navigate(`/success${location.search}`, { replace: true });
        }
      } catch (e) {
        // Silenciar para tentar novamente no próximo ciclo
      }
    };

    // Checar imediatamente e agendar polling
    checkStatus();
    interval = window.setInterval(checkStatus, 5000);

    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [location.search, navigate]);

  // Facebook Pixel: Purchase na tela Pending (disparar uma única vez)
  useEffect(() => {
    try {
      // Evitar disparos duplicados
      if (localStorage.getItem('purchase_event_fired') === 'true') {
        console.info('Purchase event already fired, skipping');
        return;
      }

      const purchaseDataStr = localStorage.getItem('checkout_purchase_data');
      if (!purchaseDataStr) return;

      const purchaseData = JSON.parse(purchaseDataStr);
      const productIds = purchaseData.products || [];
      const totalValue = purchaseData.total || 0;

      // Usar external_reference da URL como transaction_id
      const params = new URLSearchParams(location.search);
      const transactionId = params.get('external_reference') || String(Date.now());

      const purchaseParams = {
        content_ids: productIds,
        content_name: 'Planilhas Excel Pro',
        content_type: 'product',
        value: totalValue,
        currency: 'BRL',
        transaction_id: transactionId,
        predicted_ltv: totalValue * 3
      };

      // Tentar disparar via hook
      if (isEnabled) {
        trackEvent('Purchase', purchaseParams);
        console.info('✅ Facebook Pixel Purchase fired via hook:', transactionId);
      } else if (typeof window !== 'undefined' && (window as any).fbq) {
        // Fallback: disparar diretamente
        (window as any).fbq('track', 'Purchase', purchaseParams);
        console.info('✅ Facebook Pixel Purchase fired via fbq fallback:', transactionId);
      }

      // Marcar como disparado e limpar dados após 60 segundos
      localStorage.setItem('purchase_event_fired', 'true');
      window.setTimeout(() => {
        localStorage.removeItem('checkout_user_data');
        localStorage.removeItem('checkout_purchase_data');
      }, 60000);
    } catch (error) {
      console.error('Erro ao processar evento Purchase:', error);
    }
  }, [trackEvent, isEnabled, location.search]);

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
