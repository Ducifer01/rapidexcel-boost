import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Package, LogOut, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Purchase {
  id: string;
  products: string[];
  total_amount: number;
  payment_status: string;
  created_at: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [userEmail, setUserEmail] = useState("");
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthAndFetchPurchases = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/login');
        return;
      }

      setUserEmail(session.user.email || "");

      // Buscar TODAS as compras do usuário (não só approved)
      const { data, error } = await supabase
        .from('purchases')
        .select('*')
        .eq('auth_user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar compras:', error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar suas compras. Tente novamente.",
          variant: "destructive",
        });
      } else {
        setPurchases(data || []);
      }

      setLoading(false);
    };

    checkAuthAndFetchPurchases();
  }, [navigate, toast]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleDownload = async (productName: string) => {
    setDownloading(productName);

    try {
      // Chamar edge function para verificar acesso e gerar link
      const { data, error } = await supabase.functions.invoke('verify-product-access', {
        body: { product_name: productName }
      });

      if (error) throw error;

      if (data.has_access && data.download_url) {
        toast({
          title: "Download iniciado!",
          description: `O download de ${productName} será iniciado em breve.`,
        });
        
        // Iniciar download via signed URL
        window.location.href = data.download_url;
      } else {
        toast({
          title: "Acesso negado",
          description: "Você não tem permissão para baixar este produto.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao baixar:', error);
      toast({
        title: "Erro no download",
        description: "Não foi possível iniciar o download. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setDownloading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="container max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Área de Membros</h1>
            <p className="text-muted-foreground">Bem-vindo, {userEmail}</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>

        {purchases.length === 0 ? (
          <Card className="border-2 border-border/50">
            <CardContent className="pt-6 text-center py-12">
              <AlertCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhuma compra encontrada</h3>
              <p className="text-muted-foreground mb-6">
                Você ainda não realizou nenhuma compra.
              </p>
              <Button onClick={() => navigate('/')}>
                Fazer uma compra
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Iterar sobre cada compra */}
            {purchases.map((purchase) => {
              const isApproved = purchase.payment_status === 'approved';
              const isPending = purchase.payment_status === 'pending';
              const isRejected = purchase.payment_status === 'rejected' || purchase.payment_status === 'cancelled';

              return (
                <Card key={purchase.id} className="border-2 border-border/50 shadow-xl">
                  <CardHeader className="border-b border-border/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-2xl flex items-center gap-3">
                          {isApproved && (
                            <div className="flex items-center gap-2 text-green-500">
                              <CheckCircle2 className="w-6 h-6" />
                              <span>Pagamento Confirmado</span>
                            </div>
                          )}
                          {isPending && (
                            <div className="flex items-center gap-2 text-yellow-500">
                              <Loader2 className="w-6 h-6 animate-spin" />
                              <span>Aguardando Pagamento</span>
                            </div>
                          )}
                          {isRejected && (
                            <div className="flex items-center gap-2 text-red-500">
                              <AlertCircle className="w-6 h-6" />
                              <span>Pagamento Recusado</span>
                            </div>
                          )}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          Compra realizada em {new Date(purchase.created_at).toLocaleDateString('pt-BR')} às {new Date(purchase.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total pago</p>
                        <p className="text-2xl font-bold text-primary">
                          R$ {purchase.total_amount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {/* Se pagamento aprovado, mostrar produtos */}
                    {isApproved && (
                      <div className="grid gap-4">
                        {purchase.products.map((product, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-transparent rounded-lg border border-primary/20"
                          >
                            <div className="flex items-center gap-4">
                              <div className="p-3 bg-primary/10 rounded-lg">
                                <Package className="w-6 h-6 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-bold text-lg">{product}</h4>
                                <p className="text-sm text-muted-foreground">
                                  Acesso vitalício • Download ilimitado
                                </p>
                              </div>
                            </div>
                            <Button
                              onClick={() => handleDownload(product)}
                              disabled={downloading === product}
                              size="lg"
                              className="bg-gradient-to-r from-primary to-primary-glow"
                            >
                              {downloading === product ? (
                                <>
                                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                  Baixando...
                                </>
                              ) : (
                                <>
                                  <Download className="w-5 h-5 mr-2" />
                                  Baixar Arquivo
                                </>
                              )}
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Se pagamento pendente */}
                    {isPending && (
                      <div className="text-center py-8 space-y-4">
                        <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                          <h4 className="font-bold text-lg mb-2">⏳ Aguardando Confirmação do Pagamento</h4>
                          <p className="text-muted-foreground mb-4">
                            Seu pagamento está sendo processado. Isso pode levar alguns minutos.
                          </p>
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <p>• <strong>PIX:</strong> Confirmação em até 5 minutos</p>
                            <p>• <strong>Cartão de Crédito:</strong> Confirmação imediata</p>
                            <p>• <strong>Boleto:</strong> Confirmação em até 2 dias úteis</p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Produtos adquiridos: <strong>{purchase.products.join(', ')}</strong>
                        </p>
                      </div>
                    )}

                    {/* Se pagamento recusado */}
                    {isRejected && (
                      <div className="text-center py-8 space-y-4">
                        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                          <h4 className="font-bold text-lg mb-2">❌ Pagamento Não Aprovado</h4>
                          <p className="text-muted-foreground mb-4">
                            Infelizmente seu pagamento foi recusado. Tente novamente ou entre em contato com nosso suporte.
                          </p>
                          <div className="flex gap-3 justify-center">
                            <Button onClick={() => navigate('/')} variant="outline">
                              Tentar Novamente
                            </Button>
                            <Button 
                              onClick={() => window.open('https://wa.me/5511999999999?text=Preciso%20de%20ajuda%20com%20meu%20pagamento', '_blank')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Falar com Suporte
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Produtos: <strong>{purchase.products.join(', ')}</strong>
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
