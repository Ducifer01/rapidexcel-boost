import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Maria Silva",
    role: "Empreendedora",
    content: "Essas planilhas transformaram completamente a gestão do meu negócio. Economizei horas de trabalho e consegui organizar minhas finanças de forma profissional!",
    rating: 5
  },
  {
    name: "João Santos",
    role: "Analista Financeiro",
    content: "Qualidade excepcional! Os dashboards são lindos e muito funcionais. Uso diariamente no trabalho e recomendo para todos os colegas.",
    rating: 5
  },
  {
    name: "Ana Paula",
    role: "Gestora de RH",
    content: "Finalmente encontrei planilhas completas para RH. O controle de ponto e os cálculos trabalhistas me economizam dias de trabalho todo mês!",
    rating: 5
  },
  {
    name: "Carlos Eduardo",
    role: "Contador",
    content: "Como contador, preciso de precisão e praticidade. Essas planilhas entregam ambos. O suporte também é excelente!",
    rating: 5
  }
];

const Testimonials = () => {
  return (
    <section className="py-16 md:py-24 px-4 bg-background">
      <div className="container max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
            O Que Nossos Clientes Dizem
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Milhares de profissionais já transformaram sua gestão
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
            Baseado em mais de 2.500 avaliações verificadas
          </p>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
