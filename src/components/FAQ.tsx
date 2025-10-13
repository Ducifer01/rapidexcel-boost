import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "O QUE VEM NO PACK EXCEL COMPLETO PRO?",
    answer: "O Pack Excel Completo Pro inclui mais de 13.000 planilhas Excel profissionais editáveis + 50 dashboards extras premium. Todas organizadas em categorias como Finanças Pessoais e Empresariais, RH, Vendas, Logística, Engenharia, Educação e muito mais. É o pacote perfeito para quem precisa de soluções em Excel."
  },
  {
    question: "O QUE VEM NO PACK OFFICE PREMIUM?",
    answer: "O Pack Office Premium é o pacote completo! Você recebe TUDO do Pack Excel (13.000 planilhas + dashboards) MAIS +2.000 templates Word profissionais (contratos, propostas, relatórios) MAIS +50.000 slides PowerPoint para apresentações impactantes MAIS bônus exclusivos incluindo 6.000 planilhas Excel extras e materiais como 'Como Conquistar Clientes'. É literalmente mais de 60.000 arquivos profissionais!"
  },
  {
    question: "PRECISO COMPRAR OS DOIS PACKS?",
    answer: "Não! Você pode começar apenas com o Pack Excel Completo Pro por R$ 12,99. Mas se você quer a solução COMPLETA com Word e PowerPoint também, o Pack Office Premium por R$ 29,99 oferece um valor incrível - são mais de 60.000 arquivos por menos de R$ 0,001 cada um!"
  },
  {
    question: "QUANDO E COMO VOU RECEBER MEU ACESSO?",
    answer: "Após a confirmação do pagamento, você receberá automaticamente um e-mail com suas credenciais de acesso. Você poderá acessar a página de membros e fazer download dos produtos que adquiriu imediatamente. O acesso é rápido e descomplicado!"
  },
  {
    question: "OS TEMPLATES WORD E SLIDES POWERPOINT SÃO EDITÁVEIS?",
    answer: "Sim, 100%! Todos os arquivos - planilhas Excel, templates Word e slides PowerPoint - são completamente editáveis. Você pode personalizar cores, textos, adicionar sua marca, remover ou adicionar elementos conforme sua necessidade."
  },
  {
    question: "FUNCIONA EM GOOGLE DOCS E GOOGLE SLIDES?",
    answer: "Sim! Embora os arquivos sejam criados para Excel, Word e PowerPoint (Microsoft Office), eles também são compatíveis com Google Sheets, Google Docs e Google Slides. Você pode fazer upload para o Google Drive e editar normalmente."
  },
  {
    question: "POR QUANTO TEMPO TEREI ACESSO AOS ARQUIVOS?",
    answer: "O acesso é vitalício! Você pode baixar os arquivos quantas vezes quiser, para sempre. Não há renovação, mensalidades ou taxas adicionais. Uma vez comprado, é seu para sempre."
  },
  {
    question: "O PAGAMENTO É SEGURO?",
    answer: "Sim, 100% seguro! Utilizamos as plataformas de pagamento mais seguras e confiáveis do mercado (MercadoPago), com certificação SSL e criptografia de dados. Suas informações estão completamente protegidas."
  },
  {
    question: "QUAIS AS FORMAS DE PAGAMENTO?",
    answer: "Aceitamos Cartão de Crédito (parcelamento disponível), Cartão de Débito e Pix. Pagamentos via Pix são aprovados instantaneamente, enquanto cartões podem levar alguns minutos para aprovação."
  },
  {
    question: "PRECISO DE CONHECIMENTO AVANÇADO EM EXCEL, WORD OU POWERPOINT?",
    answer: "Não! Nossos arquivos são intuitivos e prontos para usar. Mesmo que você seja iniciante, conseguirá utilizar facilmente. Os templates já vêm formatados e você só precisa preencher/personalizar. Além disso, oferecemos suporte para ajudar com qualquer dúvida."
  },
  {
    question: "E SE EU NÃO GOSTAR DOS ARQUIVOS?",
    answer: "Oferecemos garantia incondicional de 7 dias. Se por qualquer motivo você não ficar satisfeito, devolvemos 100% do seu dinheiro, sem burocracia e sem perguntas."
  },
  {
    question: "FUNCIONA EM QUALQUER VERSÃO DO OFFICE?",
    answer: "Sim! Os arquivos são compatíveis com Microsoft Office 2010 ou superior (Excel, Word, PowerPoint), Office Online e também com Google Workspace (Sheets, Docs, Slides). Funcionam perfeitamente em Windows, Mac, tablets e smartphones."
  },
  {
    question: "POSSO USAR OS ARQUIVOS EM PROJETOS COMERCIAIS?",
    answer: "Sim! Você pode usar todos os arquivos em seus projetos pessoais e comerciais. Muitos clientes usam os templates para criar propostas, apresentações e relatórios para seus clientes e empresas."
  },
  {
    question: "OS ARQUIVOS SÃO ATUALIZADOS?",
    answer: "Sim! Estamos constantemente adicionando novos arquivos e melhorias. Como você tem acesso vitalício, todas as futuras atualizações e novos arquivos adicionados estarão disponíveis para você sem custo adicional."
  }
];

const FAQ = () => {
  return (
    <section className="py-16 md:py-24 px-4 bg-muted/30">
      <div className="container max-w-4xl mx-auto">
        <div className="text-center mb-12 md:mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
            Perguntas{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-glow">
              Frequentes
            </span>
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

        {/* Call to action no final */}
        <div className="mt-12 text-center p-6 bg-primary/10 border-2 border-primary/30 rounded-2xl">
          <p className="text-lg font-bold mb-2">Ainda tem dúvidas?</p>
          <p className="text-sm text-muted-foreground mb-4">
            Lembre-se: você tem 7 dias de garantia para testar sem riscos!
          </p>
          <p className="text-xs text-muted-foreground">
            Entre em contato com nosso suporte pelo chat no canto inferior direito
          </p>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
