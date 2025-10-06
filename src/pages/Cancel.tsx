import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { XCircle, ArrowLeft, HelpCircle } from "lucide-react";

const Cancel = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-950 dark:to-amber-950 p-4">
      <Card className="max-w-md w-full border-2 border-orange-500/20 shadow-2xl">
        <CardContent className="pt-8 pb-6 text-center">
          <div className="mb-6 flex justify-center">
            <div className="p-4 bg-orange-100 dark:bg-orange-900 rounded-full">
              <XCircle className="w-16 h-16 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-orange-900 dark:text-orange-100 mb-4">
            Pagamento Cancelado
          </h1>
          
          <p className="text-orange-700 dark:text-orange-300 mb-6 text-lg">
            Você cancelou o processo de pagamento.
          </p>
          
          <div className="bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3 text-left">
              <HelpCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-orange-800 dark:text-orange-200 font-semibold mb-2">
                  Precisa de ajuda?
                </p>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  Se você teve algum problema durante o checkout, entre em contato conosco pelo Instagram.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={() => navigate("/checkout")}
              className="w-full bg-orange-600 hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-600 text-white h-12 text-lg"
              size="lg"
            >
              <ArrowLeft className="mr-2 w-5 h-5" />
              Tentar Novamente
            </Button>
            
            <Button 
              onClick={() => navigate("/")}
              variant="outline"
              className="w-full"
            >
              Voltar ao Início
            </Button>
          </div>

          <p className="text-xs text-orange-700 dark:text-orange-400 mt-6">
            Dúvidas? Entre em contato via Instagram{" "}
            <a 
              href="https://instagram.com/planilhaexpress_ofc" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-orange-600 dark:text-orange-400 hover:underline font-semibold"
            >
              @planilhaexpress_ofc
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Cancel;
