import { FileSpreadsheet, Edit3, Infinity, FolderTree, Headphones, ShieldCheck, FileText, Presentation, Zap, Gift } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const benefits = [
  {
    icon: FileSpreadsheet,
    title: "60.000+ Arquivos Profissionais",
    description: "13.000 planilhas Excel + 2.000 templates Word + 50.000 slides PowerPoint - tudo em um só lugar"
  },
  {
    icon: Edit3,
    title: "Totalmente Editáveis",
    description: "Personalize cada arquivo de acordo com suas necessidades específicas - 100% customizável"
  },
  {
    icon: Infinity,
    title: "Acesso Imediato e Vitalício",
    description: "Baixe quantas vezes quiser, sem limites de tempo, renovações ou mensalidades"
  },
  {
    icon: FolderTree,
    title: "Organizados por Categorias",
    description: "Encontre rapidamente o que precisa com nossa organização inteligente por temas e segmentos"
  },
  {
    icon: Zap,
    title: "Economize 200+ Horas",
    description: "Pare de criar do zero - use modelos prontos e economize centenas de horas de trabalho"
  },
  {
    icon: Gift,
    title: "Bônus Exclusivos",
    description: "Materiais extras, ebooks e conteúdos especiais inclusos nos pacotes premium"
  },
  {
    icon: FileText,
    title: "Templates Word Profissionais",
    description: "Contratos, propostas comerciais, relatórios e documentos prontos para usar"
  },
  {
    icon: Presentation,
    title: "Slides PowerPoint Impactantes",
    description: "Apresentações profissionais para impressionar clientes, investidores e equipes"
  },
  {
    icon: Headphones,
    title: "Suporte Dedicado",
    description: "Equipe pronta para ajudar você a aproveitar ao máximo seus arquivos"
  },
  {
    icon: ShieldCheck,
    title: "Garantia de 7 Dias",
    description: "Experimente sem riscos com nossa garantia incondicional de satisfação total"
  }
];

const Benefits = () => {
  return (
    <section className="py-16 md:py-24 px-4 bg-muted/30">
      <div className="container max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
            Por Que Escolher Nossos{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-glow">
              Pacotes Completos?
            </span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Tudo que você precisa para transformar seu trabalho em um único lugar
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 md:gap-8">
          {benefits.map((benefit, index) => (
            <Card 
              key={index}
              className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_8px_30px_-8px_hsl(var(--primary)/0.3)] transform hover:-translate-y-1 group"
            >
              <CardContent className="p-6 md:p-8 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <benefit.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-bold leading-tight">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Destaque de valor */}
        <div className="mt-12 text-center">
          <div className="inline-block p-6 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border-2 border-primary/30 rounded-2xl">
            <p className="text-2xl md:text-3xl font-black mb-2">
              Mais de <span className="text-primary">60.000 Arquivos</span> Prontos!
            </p>
            <p className="text-muted-foreground text-sm md:text-base">
              Planilhas, Templates e Slides para <span className="font-bold text-foreground">estudantes, empresários, freelancers, profissionais e muito mais!</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;
