import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Lucas Mendes",
    role: "Estudante Universitário",
    content: "Essas planilhas salvaram meu TCC! Tinha tudo que eu precisava para organizar dados e fazer apresentações incríveis. E os templates Word para o trabalho final foram perfeitos!",
    rating: 5
  },
  {
    name: "Marina Costa",
    role: "Freelancer de Marketing",
    content: "Como freelancer, preciso entregar propostas profissionais. Os templates Word e slides PowerPoint me economizam horas todo mês. Melhor investimento que já fiz!",
    rating: 5
  },
  {
    name: "Roberto Silva",
    role: "Pequeno Empresário",
    content: "Finalmente consegui organizar as finanças da minha empresa! As planilhas de fluxo de caixa e controle de estoque são exatamente o que eu precisava. Vale cada centavo!",
    rating: 5
  },
  {
    name: "Ana Paula",
    role: "Gestora de RH",
    content: "Os modelos de RH são completos demais! Folha de ponto, banco de horas, cálculos trabalhistas... Tudo pronto e fácil de usar. Economizo dias de trabalho todo mês!",
    rating: 5
  },
  {
    name: "Carlos Eduardo",
    role: "Professor Particular",
    content: "Uso as planilhas para organizar minhas aulas e os slides PowerPoint para apresentações. Meus alunos adoram o material visual. Muito profissional!",
    rating: 5
  },
  {
    name: "Juliana Santos",
    role: "Profissional Autônoma",
    content: "Não sabia para onde estava indo meu dinheiro. Com as planilhas de orçamento pessoal consegui organizar tudo. Agora consigo poupar todo mês!",
    rating: 5
  },
  {
    name: "Felipe Alves",
    role: "Engenheiro Civil",
    content: "As planilhas de construção e orçamento de obras são incríveis! Uso diariamente para calcular materiais e prazos. Ferramenta indispensável!",
    rating: 5
  },
  {
    name: "Beatriz Lima",
    role: "Empreendedora Digital",
    content: "Os templates de propostas comerciais e apresentações me ajudaram a fechar mais contratos. O retorno do investimento foi imediato!",
    rating: 5
  }
];

const Testimonials = () => {
  return (
    <section className="py-16 md:py-24 px-4 bg-background">
      <div className="container max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
            O Que Nossos{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-glow">
              Clientes Dizem
            </span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Milhares de estudantes, profissionais e empresários já transformaram seu trabalho
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="border-2 hover:border-accent/50 transition-all duration-300 hover:shadow-[0_8px_30px_-8px_hsl(var(--accent)/0.3)] transform hover:-translate-y-1"
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-secondary text-secondary" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed italic">
                  "{testimonial.content}"
                </p>
                <div className="pt-4 border-t">
                  <p className="font-bold text-sm">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12 space-y-4">
          <div className="flex items-center justify-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-secondary text-secondary" />
              ))}
            </div>
            <span className="text-2xl font-bold">4.9/5.0</span>
          </div>
          <p className="text-muted-foreground">
            Baseado em mais de 2.847 avaliações verificadas
          </p>
          <p className="text-sm text-primary font-semibold">
            ⚡ Mais de 2.847 pessoas já garantiram acesso hoje!
          </p>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
