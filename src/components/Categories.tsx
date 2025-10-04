import { Briefcase, DollarSign, Users, Truck, Home, BarChart3, Hammer, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const categories = [
  {
    icon: Briefcase,
    title: "Administrativo",
    description: "Controle de estoque, cadastro de clientes, orçamentos e muito mais",
    count: "500+"
  },
  {
    icon: DollarSign,
    title: "Financeiro e Contábil",
    description: "Fluxo de caixa, DRE, análise de balanços, controle de contas",
    count: "800+"
  },
  {
    icon: Users,
    title: "Recursos Humanos",
    description: "Folha de ponto, banco de horas, cálculos trabalhistas",
    count: "400+"
  },
  {
    icon: Truck,
    title: "Logística",
    description: "Controle de frotas, gestão de entregas, rastreamento",
    count: "300+"
  },
  {
    icon: Home,
    title: "Pessoal",
    description: "Orçamento doméstico, planejamento de estudos, finanças pessoais",
    count: "600+"
  },
  {
    icon: BarChart3,
    title: "Gráficos e Dashboards",
    description: "Modelos prontos para visualização e análise de dados",
    count: "1.200+"
  },
  {
    icon: Hammer,
    title: "Engenharia e Construção",
    description: "Cálculos de materiais, cronogramas de obras, orçamentos",
    count: "450+"
  },
  {
    icon: FileText,
    title: "Outros",
    description: "Educação, saúde, vendas, marketing e muito mais",
    count: "1.750+"
  }
];

const Categories = () => {
  return (
    <section className="py-16 md:py-24 px-4 bg-muted/30">
      <div className="container max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
            Planilhas Para Todas as{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-secondary">
              Suas Necessidades
            </span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Uma biblioteca completa organizada por categorias para facilitar sua busca
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {categories.map((category, index) => (
            <Card
              key={index}
              className="border-2 hover:border-secondary/50 transition-all duration-300 hover:shadow-[0_8px_30px_-8px_hsl(var(--secondary)/0.3)] transform hover:-translate-y-1 group"
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary to-secondary-glow flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12 p-6 rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-primary/20">
          <p className="text-xl font-bold mb-2">
            Total: Mais de 6.000 Planilhas Profissionais
          </p>
          <p className="text-muted-foreground">
            Todas editáveis, organizadas e prontas para usar!
          </p>
        </div>
      </div>
    </section>
  );
};

export default Categories;
