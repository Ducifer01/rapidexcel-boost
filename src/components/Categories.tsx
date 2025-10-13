import { 
  Briefcase, DollarSign, Users, Truck, Home, BarChart3, Hammer, FileText, 
  GraduationCap, Heart, Plane, TrendingUp, Building2, ShoppingBag 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const categories = [
  {
    icon: DollarSign,
    title: "Finanças Pessoais",
    description: "Orçamento doméstico, controle de gastos, divisão de contas entre amigos/família, planejamento financeiro",
    count: "1.200+",
    examples: ["Não sabe para onde vai seu dinheiro?", "Precisa dividir gastos com colegas de casa?"]
  },
  {
    icon: TrendingUp,
    title: "Finanças Empresariais",
    description: "Fluxo de caixa, DRE, balanços, análises de lucratividade, controle de contas a pagar e receber",
    count: "1.800+",
    examples: ["Empresa precisa de controle financeiro profissional?", "Quer dashboards executivos?"]
  },
  {
    icon: ShoppingBag,
    title: "Vendas & CRM",
    description: "Controle de leads, pipeline de vendas, metas, comissões, gestão de clientes e oportunidades",
    count: "900+",
    examples: ["Ainda não tem um CRM?", "Precisa controlar vendas e metas?"]
  },
  {
    icon: Users,
    title: "RH & Gestão de Pessoas",
    description: "Folha de ponto, banco de horas, cálculos trabalhistas, recrutamento, avaliações de desempenho",
    count: "800+",
    examples: ["Gerenciar equipe manualmente?", "Calcular folha de pagamento?"]
  },
  {
    icon: Briefcase,
    title: "Administrativo & Gestão",
    description: "Controle de estoque, cadastro de fornecedores, orçamentos, contratos, ordem de serviço",
    count: "1.100+",
    examples: ["Precisa organizar seu negócio?", "Quer profissionalizar sua gestão?"]
  },
  {
    icon: Truck,
    title: "Logística & Entregas",
    description: "Controle de frotas, gestão de entregas, rastreamento, custos de transporte, rotas",
    count: "600+",
    examples: ["Gerencia entregas ou frotas?", "Precisa otimizar rotas?"]
  },
  {
    icon: Hammer,
    title: "Engenharia & Construção",
    description: "Cálculos estruturais, materiais, cronogramas de obras, orçamentos de projetos",
    count: "700+",
    examples: ["Trabalha com construção?", "Precisa orçar obras?"]
  },
  {
    icon: GraduationCap,
    title: "Educação & Estudos",
    description: "Planejamento de estudos, controle de notas, cronogramas, trabalhos acadêmicos, TCC",
    count: "500+",
    examples: ["Estudante precisa se organizar?", "Fazer trabalhos acadêmicos?"]
  },
  {
    icon: Plane,
    title: "Viagens & Expedições",
    description: "Planejamento de viagens em grupo, divisão de custos, roteiros, checklists de viagem",
    count: "300+",
    examples: ["Vai viajar em grupo?", "Precisa dividir custos de viagem?"]
  },
  {
    icon: BarChart3,
    title: "Dashboards & Relatórios",
    description: "Modelos prontos de dashboards profissionais, análise de dados, KPIs, gráficos interativos",
    count: "1.500+",
    examples: ["Quer visualizar dados de forma profissional?", "Impressionar com relatórios?"]
  },
  {
    icon: FileText,
    title: "Templates Word",
    description: "Contratos, propostas comerciais, relatórios, cartas, currículos, documentos profissionais",
    count: "2.000+",
    examples: ["Precisa de documentos profissionais?", "Quer propostas que convertem?"]
  },
  {
    icon: Building2,
    title: "Apresentações PowerPoint",
    description: "Slides para pitch, reuniões, aulas, treinamentos, palestras - todos os nichos",
    count: "50.000+",
    examples: ["Precisa impressionar em apresentações?", "Quer slides profissionais?"]
  },
  {
    icon: Heart,
    title: "Saúde & Bem-estar",
    description: "Controle de dietas, treinos, acompanhamento médico, planejamento de saúde",
    count: "250+",
    examples: ["Quer controlar saúde e bem-estar?", "Acompanhar treinos?"]
  },
  {
    icon: Home,
    title: "Uso Pessoal & Família",
    description: "Listas de compras, eventos familiares, organização doméstica, planejamentos pessoais",
    count: "400+",
    examples: ["Organizar a vida pessoal?", "Gerenciar tarefas domésticas?"]
  }
];

const Categories = () => {
  return (
    <section className="py-16 md:py-24 px-4 bg-muted/30">
      <div className="container max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
            Soluções Para{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-glow">
              Todas as Suas Necessidades
            </span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            De finanças pessoais a apresentações corporativas - temos o arquivo perfeito para você
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {categories.map((category, index) => (
            <Card
              key={index}
              className="border-2 hover:border-secondary/50 transition-all duration-300 hover:shadow-[0_8px_30px_-8px_hsl(var(--secondary)/0.3)] transform hover:-translate-y-1 group"
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary to-secondary-glow flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                    <category.icon className="w-6 h-6 text-secondary-foreground" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold">
                    {category.count}
                  </span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold">{category.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {category.description}
                  </p>
                  {category.examples && (
                    <div className="pt-2 space-y-1 border-t border-border/50">
                      {category.examples.map((example, idx) => (
                        <p key={idx} className="text-xs text-primary font-medium">
                          💡 {example}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12 p-8 rounded-2xl bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border-2 border-primary/20">
          <p className="text-2xl md:text-3xl font-black mb-3">
            Total: Mais de <span className="text-primary">60.000 Arquivos Profissionais</span>
          </p>
          <p className="text-base md:text-lg text-muted-foreground mb-4">
            <span className="font-bold text-foreground">13.000 Planilhas Excel</span> + <span className="font-bold text-foreground">2.000 Templates Word</span> + <span className="font-bold text-foreground">50.000 Slides PowerPoint</span>
          </p>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Todos <span className="font-semibold text-foreground">editáveis, organizados e prontos para usar</span> em qualquer dispositivo!
          </p>
        </div>
      </div>
    </section>
  );
};

export default Categories;
