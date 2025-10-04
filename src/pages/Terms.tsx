import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4">
      <div className="container max-w-4xl mx-auto">
        <Link to="/">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold mb-8">Termos de Serviço</h1>

        <div className="space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">1. Aceitação dos Termos</h2>
            <p>
              Ao acessar e usar o PlanilhaExpress, você concorda com estes Termos de Serviço. 
              Se você não concordar com algum dos termos, não utilize nossos serviços.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">2. Descrição do Serviço</h2>
            <p>
              O PlanilhaExpress oferece acesso a planilhas Excel e dashboards digitais através de 
              pacotes de produtos digitais. Todo o conteúdo é disponibilizado mediante pagamento único.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">3. Acesso Vitalício</h2>
            <p className="mb-2">
              O termo "acesso vitalício" significa que você terá acesso aos produtos adquiridos 
              enquanto o site PlanilhaExpress estiver em operação.
            </p>
            <p>
              <strong>Importante:</strong> O acesso vitalício está condicionado à existência e 
              operação contínua da plataforma. Caso o site deixe de existir ou encerre suas 
              atividades, o acesso aos produtos será encerrado, uma vez que não há como manter 
              o serviço sem a plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">4. Garantia de 7 Dias</h2>
            <p>
              Oferecemos garantia de 7 dias a partir da data da compra. Se você não estiver 
              satisfeito com o produto, pode solicitar o reembolso total dentro deste prazo, 
              conforme estabelecido pelo Código de Defesa do Consumidor (Lei nº 8.078/90, Art. 49).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">5. Uso dos Produtos</h2>
            <p className="mb-2">
              As planilhas e dashboards adquiridos são para uso pessoal ou comercial do comprador.
            </p>
            <p>
              É proibido: revender, redistribuir, compartilhar ou disponibilizar os arquivos 
              para terceiros sem autorização expressa.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">6. Pagamento e Entrega</h2>
            <p className="mb-2">
              O pagamento é processado de forma segura através do Mercado Pago.
            </p>
            <p>
              Após a confirmação do pagamento, você receberá acesso imediato aos produtos 
              através da área de membros.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">7. Propriedade Intelectual</h2>
            <p>
              Todos os direitos autorais e de propriedade intelectual dos produtos pertencem 
              ao PlanilhaExpress. A compra concede apenas licença de uso, não transferência de propriedade.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">8. Limitação de Responsabilidade</h2>
            <p>
              O PlanilhaExpress não se responsabiliza por danos indiretos, lucros cessantes 
              ou prejuízos decorrentes do uso ou impossibilidade de uso dos produtos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">9. Modificações nos Termos</h2>
            <p>
              Reservamo-nos o direito de modificar estes termos a qualquer momento. 
              As alterações entrarão em vigor imediatamente após a publicação no site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">10. Contato</h2>
            <p>
              Para dúvidas sobre estes Termos de Serviço, entre em contato através do nosso 
              Instagram: <a href="https://instagram.com/planilhaexpress_ofc" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">@planilhaexpress_ofc</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;
