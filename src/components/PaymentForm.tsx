import { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle } from "lucide-react";

declare global {
  interface Window {
    MercadoPago: any;
  }
}

interface PaymentFormProps {
  onCardTokenChange: (token: string | null) => void;
  disabled?: boolean;
  publicKey: string;
}

export const PaymentForm = ({ onCardTokenChange, disabled, publicKey }: PaymentFormProps) => {
  const [cardNumber, setCardNumber] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [expirationMonth, setExpirationMonth] = useState("");
  const [expirationYear, setExpirationYear] = useState("");
  const [securityCode, setSecurityCode] = useState("");
  const [installments, setInstallments] = useState("1");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const mpRef = useRef<any>(null);

  useEffect(() => {
    if (window.MercadoPago && publicKey) {
      mpRef.current = new window.MercadoPago(publicKey);
    }
  }, [publicKey]);

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted.substring(0, 19);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 13) {
      newErrors.cardNumber = "Número do cartão inválido";
    }
    if (!cardholderName || cardholderName.length < 3) {
      newErrors.cardholderName = "Nome deve ter pelo menos 3 caracteres";
    }
    if (!expirationMonth) {
      newErrors.expirationMonth = "Selecione o mês";
    }
    if (!expirationYear) {
      newErrors.expirationYear = "Selecione o ano";
    }
    if (!securityCode || securityCode.length < 3) {
      newErrors.securityCode = "CVV inválido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createCardToken = async () => {
    if (!validateForm()) {
      onCardTokenChange(null);
      return;
    }

    if (!mpRef.current) {
      setErrors({ general: "Erro ao inicializar MercadoPago" });
      onCardTokenChange(null);
      return;
    }

    try {
      const cardData = {
        cardNumber: cardNumber.replace(/\s/g, ''),
        cardholderName,
        cardExpirationMonth: expirationMonth,
        cardExpirationYear: expirationYear,
        securityCode,
        identificationType: 'CPF',
        identificationNumber: '', // Será preenchido no backend
      };

      const token = await mpRef.current.createCardToken(cardData);
      onCardTokenChange(token.id);
      setErrors({});
    } catch (error: any) {
      console.error('Erro ao criar token:', error);
      setErrors({ general: "Erro ao processar cartão. Verifique os dados." });
      onCardTokenChange(null);
    }
  };

  useEffect(() => {
    if (cardNumber && cardholderName && expirationMonth && expirationYear && securityCode) {
      createCardToken();
    }
  }, [cardNumber, cardholderName, expirationMonth, expirationYear, securityCode]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 15 }, (_, i) => currentYear + i);

  return (
    <div className="space-y-4">
      {/* Número do Cartão */}
      <div>
        <Label htmlFor="cardNumber" className="text-sm md:text-base font-semibold mb-2 block">
          Número do Cartão *
        </Label>
        <Input
          id="cardNumber"
          placeholder="0000 0000 0000 0000"
          value={cardNumber}
          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
          maxLength={19}
          className={`h-12 font-mono ${errors.cardNumber ? "border-destructive" : ""}`}
          disabled={disabled}
        />
        {errors.cardNumber && (
          <p className="text-xs md:text-sm text-destructive mt-2 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 flex-shrink-0" />
            {errors.cardNumber}
          </p>
        )}
      </div>

      {/* Nome no Cartão */}
      <div>
        <Label htmlFor="cardholderName" className="text-sm md:text-base font-semibold mb-2 block">
          Nome no Cartão *
        </Label>
        <Input
          id="cardholderName"
          placeholder="Como está impresso no cartão"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value.toUpperCase())}
          className={`h-12 ${errors.cardholderName ? "border-destructive" : ""}`}
          disabled={disabled}
        />
        {errors.cardholderName && (
          <p className="text-xs md:text-sm text-destructive mt-2 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 flex-shrink-0" />
            {errors.cardholderName}
          </p>
        )}
      </div>

      {/* Validade e CVV */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm md:text-base font-semibold">
            Validade *
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <Select value={expirationMonth} onValueChange={setExpirationMonth} disabled={disabled}>
              <SelectTrigger className={`h-12 ${errors.expirationMonth ? "border-destructive" : ""}`}>
                <SelectValue placeholder="MM" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => {
                  const month = (i + 1).toString().padStart(2, '0');
                  return <SelectItem key={month} value={month}>{month}</SelectItem>;
                })}
              </SelectContent>
            </Select>
            <Select value={expirationYear} onValueChange={setExpirationYear} disabled={disabled}>
              <SelectTrigger className={`h-12 ${errors.expirationYear ? "border-destructive" : ""}`}>
                <SelectValue placeholder="AAAA" />
              </SelectTrigger>
              <SelectContent>
                {years.map(year => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {(errors.expirationMonth || errors.expirationYear) && (
            <p className="text-xs md:text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3 flex-shrink-0" />
              {errors.expirationMonth || errors.expirationYear}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="securityCode" className="text-sm md:text-base font-semibold mb-2 block">
            CVV *
          </Label>
          <Input
            id="securityCode"
            type="text"
            placeholder="123"
            value={securityCode}
            onChange={(e) => setSecurityCode(e.target.value.replace(/\D/g, '').substring(0, 4))}
            maxLength={4}
            className={`h-12 font-mono ${errors.securityCode ? "border-destructive" : ""}`}
            disabled={disabled}
          />
          {errors.securityCode && (
            <p className="text-xs md:text-sm text-destructive mt-2 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 flex-shrink-0" />
              {errors.securityCode}
            </p>
          )}
        </div>
      </div>

      {/* Parcelas */}
      <div>
        <Label htmlFor="installments" className="text-sm md:text-base font-semibold mb-2 block">
          Parcelamento
        </Label>
        <Select value={installments} onValueChange={setInstallments} disabled={disabled}>
          <SelectTrigger className="h-12">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1x sem juros</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {errors.general && (
        <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
          <p className="text-xs md:text-sm text-destructive flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {errors.general}
          </p>
        </div>
      )}
    </div>
  );
};
