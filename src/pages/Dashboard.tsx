import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, LogOut, Loader2, Clock, CheckCircle2, XCircle, AlertCircle, FileSpreadsheet, BarChart3, Sparkles, ShoppingCart, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PRODUCTS } from "@/lib/products";

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
  const [downloadingProduct, setDownloadingProduct] = useState<string | null>(null);
  const [buyingProduct, setBuyingProduct] = useState<string | null>(null);
  const [supportConfig, setSupportConfig] = useState({ 
    tawkEnabled: false, 
    supportEmail: '' 
  });

  useEffect(() => {
    checkUser();
    loadSupportConfig();
  }, []);

  const loadSupportConfig = async () => {
    const { data } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['tawk_enabled', 'support_email']);
    
    const config = data?.reduce((acc, item) => {
      if (item.key === 'tawk_enabled') acc.tawkEnabled = item.value === 'true';
      if (item.key === 'support_email') acc.supportEmail = item.value;
      return acc;
    }, { tawkEnabled: false, supportEmail: '' });
    
    setSupportConfig(config || { tawkEnabled: false, supportEmail: '' });
  };

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/login");
        return;
      }

      setUserEmail(user.email || "");
      await fetchPurchases(user.id);
    } catch (error) {
      console.error("Erro ao verificar usuário:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar seus dados.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPurchases = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("purchases")
        .select("*")
        .eq("auth_user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPurchases(data || []);
    } catch (error) {
      console.error("Erro ao buscar compras:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar suas compras.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const handleDownload = async (productName: string) => {
    setDownloadingProduct(productName);
    try {
      const { data, error } = await supabase.functions.invoke("verify-product-access", {
        body: { product_name: productName },
      });

      if (error) throw error;

      if (data?.download_url) {
        window.open(data.download_url, "_blank");
        toast({
          title: "Download iniciado!",
          description: "Seu download começará em instantes.",
        });
      }
    } catch (error) {
      console.error("Erro ao baixar:", error);
      toast({
        title: "Erro no download",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setDownloadingProduct(null);
    }
  };

  const handleBuyProduct = async (productId: string) => {
    setBuyingProduct(productId);
    
    toast({
      title: "Processando...",
      description: "Preparando seu pagamento no MercadoPago.",
    });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          product_ids: [productId],
          authenticated_user_id: user.id
        }
      });

      if (error) throw error;

      if (data?.init_point) {
        window.open(data.init_point, '_blank');
        toast({
          title: "Redirecionando para pagamento",
          description: "Você será levado ao MercadoPago para finalizar sua compra.",
        });
      }
    } catch (error) {
      console.error("Erro ao iniciar compra:", error);
      toast({
        title: "Erro ao processar pagamento",
        description: error instanceof Error ? error.message : "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setBuyingProduct(null);
    }
  };

  const userProducts = purchases
    .filter(p => p.payment_status === 'approved')
    .flatMap(p => p.products);

  // Verifica quais product IDs o usuário já possui
  const userProductIds = PRODUCTS
    .filter(product => userProducts.some(up => up === product.name || up === product.id))
    .map(product => product.id);

  // Filtra produtos que o usuário não tem E que pode comprar (verificando requiredProducts)
  const missingProducts = PRODUCTS.filter(product => {
    // Verifica se o usuário já tem este produto
    const hasProduct = userProducts.some(up => up === product.name || up === product.id);
    if (hasProduct) return false;

    // Verifica se o produto tem requisitos
    if (product.requiredProducts && product.requiredProducts.length > 0) {
      // Verifica se o usuário tem TODOS os produtos requeridos
      const hasAllRequiredProducts = product.requiredProducts.every(reqId => 
        userProductIds.includes(reqId)
      );
      return hasAllRequiredProducts;
    }

    // Se não tem requisitos, pode mostrar
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-4 md:py-8 px-3 md:px-6">
      <div className="w-full max-w-6xl mx-auto space-y-4 md:space-y-6">
        
        {/* Header Mobile-First */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-black text-foreground">
              Área de Membros
            </h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1">
              Olá, <span className="text-primary font-semibold">{userEmail}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                if (supportConfig.tawkEnabled) {
                  if ((window as any).Tawk_API && (window as any).Tawk_API.maximize) {
                    (window as any).Tawk_API.maximize();
                  } else {
                    toast({
                      title: "Chat de suporte",
                      description: "O chat de suporte está sendo carregado...",
                    });
                  }
                } else {
                  toast({
                    title: "📧 Entre em Contato",
                    description: `Email: ${supportConfig.supportEmail}`,
                    duration: 6000,
                  });
                }
              }}
              variant="outline"
              size="sm"
              className="w-full sm:w-auto h-9 md:h-10 text-sm"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Suporte
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="w-full sm:w-auto h-9 md:h-10 text-sm"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>

        {/* Produtos Disponíveis para Compra */}
        {missingProducts.length > 0 && (
          <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-transparent backdrop-blur">
            <CardHeader className="border-b border-primary/20">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Sparkles className="w-5 h-5 text-primary" />
                Produtos Disponíveis para Compra
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 space-y-3">
              {missingProducts.map(product => {
                const isBuying = buyingProduct === product.id;
                return (
                  <div 
                    key={product.id} 
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-background/50 rounded-lg border border-primary/20 hover:border-primary/40 transition-colors"
                  >
                    <div className="space-y-1">
                      <h4 className="font-bold text-base">{product.name}</h4>
                      <p className="text-2xl font-black text-primary">R$ {product.price.toFixed(2)}</p>
                    </div>
                    <Button 
                      onClick={() => handleBuyProduct(product.id)}
                      disabled={isBuying}
                      size="lg"
                      className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary"
                    >
                      {isBuying ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Comprar Agora
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Lista de Compras */}
        {purchases.length === 0 ? (
          <Card className="border-2 border-border/50 bg-card/90 backdrop-blur">
            <CardContent className="flex flex-col items-center justify-center py-12 md:py-16 px-4 text-center">
              <AlertCircle className="w-12 h-12 md:w-16 md:h-16 text-muted-foreground mb-4" />
              <h3 className="text-lg md:text-xl font-bold mb-2">Nenhuma compra encontrada</h3>
              <p className="text-sm md:text-base text-muted-foreground max-w-md">
                Você ainda não possui nenhuma compra. Acesse nossa página inicial para conhecer nossos produtos.
              </p>
              <Button
                onClick={() => navigate("/")}
                className="mt-6 w-full sm:w-auto"
                size="lg"
              >
                Ver Produtos
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4 md:space-y-6">
            {purchases.map((purchase) => (
              <Card
                key={purchase.id}
                className="border-2 border-border/50 bg-card/90 backdrop-blur overflow-hidden"
              >
                {/* Header do Card */}
                <CardHeader className="bg-gradient-to-br from-primary/5 to-transparent p-3 md:p-6 border-b border-border/50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="space-y-1">
                      <CardTitle className="text-base md:text-xl flex items-center gap-2 flex-wrap">
                        Pedido #{purchase.id.slice(0, 8)}
                        {purchase.payment_status === "approved" && (
                          <Badge className="bg-primary text-white text-xs">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Pago
                          </Badge>
                        )}
                        {purchase.payment_status === "pending" && (
                          <Badge variant="outline" className="text-orange-500 border-orange-500 text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            Pendente
                          </Badge>
                        )}
                        {(purchase.payment_status === "rejected" || purchase.payment_status === "cancelled") && (
                          <Badge variant="destructive" className="text-xs">
                            <XCircle className="w-3 h-3 mr-1" />
                            Recusado
                          </Badge>
                        )}
                      </CardTitle>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        {new Date(purchase.created_at).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-xl md:text-2xl font-black text-primary">
                        R$ {purchase.total_amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-3 md:p-6">
                  {/* Status: Aprovado */}
                  {purchase.payment_status === "approved" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-3 md:gap-4">
                        {purchase.products.map((product, idx) => {
                          const isDownloading = downloadingProduct === product;
                          const isPack1 = product.includes("6k") || product.includes("6.000");
                          
                          return (
                            <div
                              key={idx}
                              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 md:p-4 bg-gradient-to-br from-primary/5 to-transparent rounded-lg border border-primary/20"
                            >
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                                  {isPack1 ? (
                                    <FileSpreadsheet className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                                  ) : (
                                    <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h4 className="font-bold text-sm md:text-base break-words">
                                    {product}
                                  </h4>
                                  <p className="text-xs md:text-sm text-muted-foreground mt-1">
                                    Disponível para download
                                  </p>
                                </div>
                              </div>
                              <Button
                                onClick={() => handleDownload(product)}
                                disabled={isDownloading}
                                size="sm"
                                className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary h-9 md:h-10 text-sm flex-shrink-0"
                              >
                                {isDownloading ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Baixando...
                                  </>
                                ) : (
                                  <>
                                    <Download className="w-4 h-4 mr-2" />
                                    Baixar
                                  </>
                                )}
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Status: Pendente */}
                  {purchase.payment_status === "pending" && (
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 md:p-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <Clock className="w-8 h-8 md:w-10 md:h-10 text-orange-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base md:text-lg font-bold text-foreground mb-2">
                            ⏳ Pagamento em processamento
                          </h3>
                          <p className="text-xs md:text-sm text-muted-foreground mb-3">
                            Seu pagamento está sendo processado. Isso pode levar alguns minutos.
                          </p>
                          <div className="space-y-2">
                            <p className="text-xs md:text-sm font-semibold text-foreground">
                              Produtos do pedido:
                            </p>
                            <ul className="space-y-1">
                              {purchase.products.map((product, idx) => (
                                <li key={idx} className="text-xs md:text-sm text-muted-foreground flex items-start gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                                  <span className="break-words">{product}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <p className="text-xs text-orange-500 font-medium mt-4">
                            ℹ️ Após a confirmação, seus produtos ficarão disponíveis para download aqui.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Status: Recusado/Cancelado */}
                  {(purchase.payment_status === "rejected" || purchase.payment_status === "cancelled") && (
                    <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 md:p-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <XCircle className="w-8 h-8 md:w-10 md:h-10 text-destructive flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base md:text-lg font-bold text-foreground mb-2">
                            ❌ Pagamento não aprovado
                          </h3>
                          <p className="text-xs md:text-sm text-muted-foreground mb-4">
                            Infelizmente seu pagamento não foi aprovado. Isso pode acontecer por diversos motivos:
                          </p>
                          <ul className="space-y-2 mb-4">
                            <li className="text-xs md:text-sm text-muted-foreground flex items-start gap-2">
                              • Saldo insuficiente no cartão
                            </li>
                            <li className="text-xs md:text-sm text-muted-foreground flex items-start gap-2">
                              • Dados incorretos do cartão
                            </li>
                            <li className="text-xs md:text-sm text-muted-foreground flex items-start gap-2">
                              • Problemas com a operadora
                            </li>
                          </ul>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button
                              onClick={() => navigate("/checkout")}
                              className="w-full sm:w-auto"
                              size="sm"
                            >
                              Tentar Novamente
                            </Button>
                            <Button
                              onClick={() => window.open("https://wa.me/5511999999999", "_blank")}
                              variant="outline"
                              className="w-full sm:w-auto"
                              size="sm"
                            >
                              Falar com Suporte
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
