import { FileSpreadsheet, Edit3, Infinity, FolderTree, Headphones, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const benefits = [
  {
    icon: FileSpreadsheet,
    title: "+6.000 Planilhas Prontas",
    description: "Uma biblioteca gigantesca de planilhas para todas as suas necessidades profissionais e pessoais"
  },
  {
    icon: Edit3,
    title: "Totalmente Editáveis",
    description: "Personalize cada planilha de acordo com suas necessidades específicas"
  },
  {
    icon: Infinity,
    title: "Acesso Imediato e Vitalício",
    description: "Baixe quantas vezes quiser, sem limites de tempo ou renovações"
  },
  {
    icon: FolderTree,
    title: "Organizadas por Categorias",
    description: "Encontre rapidamente o que precisa com nossa organização inteligente"
  },
  {
    icon: Headphones,
    title: "Suporte ao Cliente",
    description: "Equipe dedicada pronta para ajudar você a aproveitar ao máximo suas planilhas"
  },
  {
    icon: ShieldCheck,
    title: "Garantia de 7 Dias",
    description: "Experimente sem riscos com nossa garantia de satisfação total"
  }
];

const Benefits = () => {
  return (
    <section className="py-16 md:py-24 px-4 bg-muted/30">
      <div className="container max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
            Por Que Escolher Nossas Planilhas?
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Tudo que você precisa para otimizar sua gestão em um único lugar
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {benefits.map((benefit, index) => (
            <Card 
              key={index}
              className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_8px_30px_-8px_hsl(var(--primary)/0.3)] transform hover:-translate-y-1 group"
            >
              <CardContent className="p-6 md:p-8 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <benefit.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold">{benefit.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
