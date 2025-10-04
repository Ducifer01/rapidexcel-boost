import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4">
      <div className="container max-w-4xl mx-auto">
        <Link to="/">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold mb-8">Política de Privacidade</h1>

        <div className="space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">1. Informações que Coletamos</h2>
            <p className="mb-2">
              O PlanilhaExpress coleta informações necessárias para processar suas compras e 
              fornecer acesso aos produtos:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Nome completo</li>
              <li>Endereço de e-mail</li>
              <li>Informações de pagamento (processadas pelo Mercado Pago)</li>
              <li>Dados de navegação e uso da plataforma</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">2. Como Usamos Suas Informações</h2>
            <p className="mb-2">Utilizamos suas informações para:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Processar e entregar suas compras</li>
              <li>Gerenciar seu acesso aos produtos</li>
              <li>Enviar atualizações sobre seus pedidos</li>
              <li>Melhorar nossos serviços e experiência do usuário</li>
              <li>Cumprir obrigações legais</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">3. Compartilhamento de Informações</h2>
            <p className="mb-2">
              Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, 
              exceto:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Mercado Pago (processamento de pagamentos)</li>
              <li>Quando exigido por lei</li>
              <li>Para proteger nossos direitos legais</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">4. Segurança dos Dados</h2>
            <p>
              Implementamos medidas de segurança técnicas e organizacionais para proteger 
              suas informações contra acesso não autorizado, perda ou alteração. Todos os 
              dados de pagamento são processados de forma segura através do Mercado Pago.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">5. Cookies e Tecnologias Similares</h2>
            <p>
              Utilizamos cookies e tecnologias similares para melhorar sua experiência, 
              analisar o uso do site e personalizar conteúdo. Você pode configurar seu 
              navegador para recusar cookies, mas isso pode afetar algumas funcionalidades.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">6. Seus Direitos (LGPD)</h2>
            <p className="mb-2">
              Conforme a Lei Geral de Proteção de Dados (LGPD), você tem direito a:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Confirmar a existência de tratamento de dados</li>
              <li>Acessar seus dados pessoais</li>
              <li>Corrigir dados incompletos ou desatualizados</li>
              <li>Solicitar a exclusão de dados pessoais</li>
              <li>Revogar consentimento</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">7. Retenção de Dados</h2>
            <p>
              Mantemos suas informações pelo tempo necessário para cumprir os propósitos 
              descritos nesta política, cumprir obrigações legais e resolver disputas.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">8. Alterações nesta Política</h2>
            <p>
              Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos 
              sobre mudanças significativas através do e-mail cadastrado ou aviso no site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">9. Contato</h2>
            <p>
              Para questões sobre esta Política de Privacidade ou exercer seus direitos, 
              entre em contato através do Instagram: <a href="https://instagram.com/planilhaexpress_ofc" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">@planilhaexpress_ofc</a>
            </p>
          </section>

          <section className="pt-4">
            <p className="text-sm">
              <strong>Última atualização:</strong> Janeiro de 2025
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
