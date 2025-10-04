import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "QUANDO E COMO VOU RECEBER MEU ACESSO?",
    answer: "Após a confirmação do pagamento, você receberá automaticamente um e-mail com suas credenciais de acesso. Você poderá acessar a página de membros e fazer download dos produtos que adquiriu imediatamente. O acesso é rápido e descomplicado!"
  },
  {
    question: "POR QUANTO TEMPO TEREI ACESSO AOS ARQUIVOS?",
    answer: "O acesso é vitalício! Você pode baixar as planilhas quantas vezes quiser, para sempre. Não há renovação, mensalidades ou taxas adicionais. Uma vez comprado, é seu para sempre."
  },
  {
    question: "O PAGAMENTO É SEGURO?",
    answer: "Sim, 100% seguro! Utilizamos as plataformas de pagamento mais seguras e confiáveis do mercado, com certificação SSL e criptografia de dados. Suas informações estão completamente protegidas."
  },
  {
    question: "QUAIS AS FORMAS DE PAGAMENTO?",
    answer: "Aceitamos Cartão de Crédito (parcelamento disponível), Cartão de Débito e Pix. Pagamentos via Pix são aprovados instantaneamente, enquanto cartões podem levar alguns minutos para aprovação."
  },
  {
    question: "AS PLANILHAS SÃO EDITÁVEIS?",
    answer: "Sim! Todas as planilhas são 100% editáveis para que você possa personalizar completamente de acordo com sua necessidade. Você pode alterar cores, adicionar ou remover campos, inserir sua marca e muito mais."
  },
  {
    question: "PRECISO DE CONHECIMENTO AVANÇADO EM EXCEL?",
    answer: "Não! Nossas planilhas são intuitivas e prontas para usar. Mesmo que você seja iniciante no Excel, conseguirá utilizar facilmente. Além disso, oferecemos suporte para ajudar com qualquer dúvida."
  },
  {
    question: "E SE EU NÃO GOSTAR DAS PLANILHAS?",
    answer: "Oferecemos garantia incondicional de 7 dias. Se por qualquer motivo você não ficar satisfeito, devolvemos 100% do seu dinheiro, sem burocracia e sem perguntas."
  },
  {
    question: "FUNCIONA EM QUALQUER VERSÃO DO EXCEL?",
    answer: "Sim! As planilhas são compatíveis com Excel 2010 ou superior, Excel Online e também com o Google Sheets. Funcionam perfeitamente em Windows, Mac, tablets e smartphones."
  }
];

const FAQ = () => {
  return (
    <section className="py-16 md:py-24 px-4 bg-muted/30">
      <div className="container max-w-4xl mx-auto">
        <div className="text-center mb-12 md:mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
            Perguntas Frequentes
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground">
            Tire todas as suas dúvidas antes de adquirir
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="border-2 rounded-xl px-6 bg-background hover:border-primary/50 transition-colors duration-300"
            >
              <AccordionTrigger className="text-left font-bold hover:no-underline py-6">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQ;
