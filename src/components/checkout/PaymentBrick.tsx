import { memo, useMemo } from "react";
import { Payment } from "@mercadopago/sdk-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export interface PaymentBrickProps {
  amount: number;
  preferenceId?: string;
  externalReference: string;
  onResult?: (status: string) => void;
}

// Componente isolado e memoizado para evitar re-renderizações do Brick
const PaymentBrick = memo(function PaymentBrick({
  amount,
  preferenceId,
  externalReference,
  onResult,
}: PaymentBrickProps) {
  const navigate = useNavigate();

  const initialization = useMemo(() => ({
    amount,
    // preferenceId é recomendado pela doc; se não houver, o Brick ainda renderiza para a maioria dos métodos
    ...(preferenceId ? { preferenceId } : {}),
  }), [amount, preferenceId]);

  const customization = useMemo(() => ({
    paymentMethods: {
      ticket: "all" as const,
      bankTransfer: "all" as const,
      creditCard: "all" as const,
      prepaidCard: "all" as const,
      debitCard: "all" as const,
      mercadoPago: "all" as const,
      maxInstallments: 1,
    },
    visual: { style: { theme: "default" as const } },
  }), []);

  const onSubmit = ({ selectedPaymentMethod, formData }: any) => {
    return new Promise((resolve, reject) => {
      supabase.functions
        .invoke("process-payment", {
          body: { ...formData, external_reference: externalReference },
        })
        .then(({ data, error }) => {
          if (error) return reject(error);
          const status = data?.payment?.status || data?.status;
          onResult?.(status);
          if (status === "approved") navigate("/success");
          else if (status === "pending" || status === "in_process") navigate("/pending");
          else navigate("/failure");
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  };

  const onReady = () => {
    // Opcional: esconder loaders
    // console.info("Payment Brick está pronto");
  };

  const onError = (error: any) => {
    console.error("Erro no Payment Brick:", error);
  };

  return (
    <div className="min-h-[320px] w-full">
      <Payment
        initialization={initialization}
        customization={customization}
        onSubmit={onSubmit}
        onReady={onReady}
        onError={onError}
      />
    </div>
  );
});

export default PaymentBrick;
