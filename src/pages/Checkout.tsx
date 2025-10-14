import { useState, useEffect } from "react";
import { initMercadoPago, Payment } from "@mercadopago/sdk-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, CreditCard, QrCode, FileText } from "lucide-react";
import { PRODUCTS } from "@/lib/products";
import { toast } from "sonner";

type PaymentMethod = "pix" | "credit" | "boleto";

const Checkout = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [externalReference, setExternalReference] = useState<string | null>(null);
  const [mpReady, setMpReady] = useState(false);
  const [loadingPref, setLoadingPref] = useState(false);
  const [brickReady, setBrickReady] = useState(false);

  // Inicializar Mercado Pago
  useEffect(() => {
    const initMP = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("get-public-key");
        if (error) throw error;
        if (data?.public_key) {
          initMercadoPago(data.public_key, { locale: "pt-BR" });
          setMpReady(true);
        }
      } catch (error) {
        console.error("Erro ao inicializar MP:", error);
        toast.error("Erro ao carregar forma de pagamento");
      }
    };
    initMP();
  }, []);

  // Atualizar amount quando produto selecionado
  useEffect(() => {
    if (selectedProductId) {
      const product = PRODUCTS.find((p) => p.id === selectedProductId);
      if (product) {
        setAmount(product.price);
      }
    }
  }, [selectedProductId]);

  // Criar preferência ao selecionar método de pagamento
  const handleMethodSelect = async (method: PaymentMethod) => {
    setSelectedMethod(method);
    setLoadingPref(true);

    try {
      const { data, error } = await supabase.functions.invoke("create-payment", {
        body: {
          product_ids: [selectedProductId],
        },
      });

      if (error) throw error;

      if (data?.preference_id && data?.external_reference) {
        setPreferenceId(data.preference_id);
        setExternalReference(data.external_reference);
        setStep(3);
      } else {
        throw new Error("Resposta inválida do servidor");
      }
    } catch (error: any) {
      console.error("Erro ao criar preferência:", error);
      toast.error(error.message || "Erro ao processar pagamento");
    } finally {
      setLoadingPref(false);
    }
  };

  // Configuração do Brick por método
  const getCustomization = () => {
    const baseCustomization = {
      visual: { style: { theme: "default" as const } },
    };

    if (selectedMethod === "pix") {
      return {
        ...baseCustomization,
        paymentMethods: {
          bankTransfer: ["pix"],
        },
      };
    } else if (selectedMethod === "credit") {
      return {
        ...baseCustomization,
        paymentMethods: {
          creditCard: "all" as const,
          maxInstallments: 1,
        },
      };
    } else if (selectedMethod === "boleto") {
      return {
        ...baseCustomization,
        paymentMethods: {
          ticket: "all" as const,
        },
      };
    }
    
    return {
      ...baseCustomization,
      paymentMethods: {
        creditCard: "all" as const,
        bankTransfer: "all" as const,
        ticket: "all" as const,
        maxInstallments: 1,
      },
    };
  };

  const onSubmit = async ({ formData }: any) => {
    return new Promise((resolve, reject) => {
      supabase.functions
        .invoke("process-payment", {
          body: { ...formData, external_reference: externalReference },
        })
        .then(({ data, error }) => {
          if (error) return reject(error);
          const status = data?.payment?.status || data?.status;
          if (status === "approved") navigate("/success");
          else if (status === "pending" || status === "in_process") navigate("/pending");
          else navigate("/failure");
          resolve(data);
        })
        .catch(reject);
    });
  };

  const canRenderBrick = mpReady && preferenceId && externalReference && amount > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Finalizar Compra</h1>
          <p className="text-muted-foreground">
            {step === 1 && "Escolha seu produto"}
            {step === 2 && "Escolha a forma de pagamento"}
            {step === 3 && "Complete seu pagamento"}
          </p>
        </div>

        {/* Step 1: Seleção de Produto */}
        {step === 1 && (
          <div className="space-y-4">
            {PRODUCTS.map((product) => (
              <Card
                key={product.id}
                className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                  selectedProductId === product.id
                    ? "ring-2 ring-primary bg-primary/5"
                    : ""
                }`}
                onClick={() => setSelectedProductId(product.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                    <p className="text-muted-foreground mb-4">{product.description}</p>
                    <p className="text-2xl font-bold text-primary">
                      R$ {product.price.toFixed(2)}
                    </p>
                  </div>
                  {selectedProductId === product.id && (
                    <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0" />
                  )}
                </div>
              </Card>
            ))}

            <Button
              size="lg"
              className="w-full"
              disabled={!selectedProductId}
              onClick={() => setStep(2)}
            >
              Continuar
            </Button>
          </div>
        )}

        {/* Step 2: Seleção de Método */}
        {step === 2 && (
          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full h-auto p-6 justify-start"
              disabled={loadingPref}
              onClick={() => handleMethodSelect("pix")}
            >
              <QrCode className="w-8 h-8 mr-4" />
              <div className="text-left">
                <div className="font-bold text-lg">PIX</div>
                <div className="text-sm text-muted-foreground">
                  Aprovação instantânea
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full h-auto p-6 justify-start"
              disabled={loadingPref}
              onClick={() => handleMethodSelect("credit")}
            >
              <CreditCard className="w-8 h-8 mr-4" />
              <div className="text-left">
                <div className="font-bold text-lg">Cartão de Crédito</div>
                <div className="text-sm text-muted-foreground">
                  Parcelamento em até 1x
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full h-auto p-6 justify-start"
              disabled={loadingPref}
              onClick={() => handleMethodSelect("boleto")}
            >
              <FileText className="w-8 h-8 mr-4" />
              <div className="text-left">
                <div className="font-bold text-lg">Boleto Bancário</div>
                <div className="text-sm text-muted-foreground">
                  Aprovação em 1-2 dias úteis
                </div>
              </div>
            </Button>

            <Button variant="ghost" className="w-full" onClick={() => setStep(1)}>
              Voltar
            </Button>
          </div>
        )}

        {/* Step 3: Payment Brick */}
        {step === 3 && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Resumo do Pedido</h2>
              <div className="flex justify-between items-center mb-2">
                <span>Produto:</span>
                <span className="font-semibold">
                  {PRODUCTS.find((p) => p.id === selectedProductId)?.name}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span>Método:</span>
                <span className="font-semibold capitalize">{selectedMethod}</span>
              </div>
              <div className="border-t pt-2 mt-2 flex justify-between items-center">
                <span className="text-lg font-bold">Total:</span>
                <span className="text-2xl font-bold text-primary">
                  R$ {amount.toFixed(2)}
                </span>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Dados do Pagamento</h2>
              
              {!brickReady && canRenderBrick && (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              )}

              <div className={brickReady ? "" : "opacity-0 h-0 overflow-hidden"}>
                {canRenderBrick && (
                  <Payment
                    initialization={{
                      amount,
                      preferenceId,
                    }}
                    customization={getCustomization()}
                    onSubmit={onSubmit}
                    onReady={() => setBrickReady(true)}
                    onError={(error) => {
                      console.error("Erro no Brick:", error);
                      toast.error("Erro ao carregar pagamento");
                    }}
                  />
                )}
              </div>
            </Card>

            <Button
              variant="ghost"
              className="w-full"
              onClick={() => {
                setStep(2);
                setPreferenceId(null);
                setExternalReference(null);
                setSelectedMethod(null);
                setBrickReady(false);
              }}
            >
              Voltar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;
