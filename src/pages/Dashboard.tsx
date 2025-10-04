import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Package, Shield, LogOut, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
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

      // Buscar compras aprovadas do usuário
      const { data, error } = await supabase
        .from('purchases')
        .select('*')
        .eq('auth_user_id', session.user.id)
        .eq('payment_status', 'approved')
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
                Aguardando confirmação do pagamento ou você ainda não realizou nenhuma compra.
              </p>
              <Button onClick={() => navigate('/')}>
                Voltar para a página inicial
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Status Info */}
            <Card className="border-2 border-primary/30 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/20 rounded-full">
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Pagamento Confirmado!</h3>
                    <p className="text-sm text-muted-foreground">
                      Você tem acesso a {purchases.reduce((acc, p) => acc + p.products.length, 0)} produto(s)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Produtos */}
            {purchases.map((purchase) => (
              <Card key={purchase.id} className="border-2 border-border/50 shadow-xl">
                <CardHeader className="border-b border-border/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl">Seus Produtos</CardTitle>
                      <CardDescription>
                        Compra realizada em {new Date(purchase.created_at).toLocaleDateString('pt-BR')}
                      </CardDescription>
                    </div>
                    <Badge className="bg-primary">
                      R$ {purchase.total_amount.toFixed(2).replace('.', ',')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
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
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                              <Shield className="w-4 h-4" />
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
                </CardContent>
              </Card>
            ))}

            {/* Garantia */}
            <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Shield className="w-8 h-8 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-lg mb-2">Garantia de 7 Dias</h3>
                    <p className="text-sm text-muted-foreground">
                      Se você não estiver satisfeito com suas planilhas, devolvemos 100% do seu dinheiro dentro de 7 dias após a compra.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
