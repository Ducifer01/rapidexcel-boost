import { Star } from 'lucide-react';

const testimonials = [
  {
    name: "Carlos M.",
    location: "São Paulo, SP",
    comment: "Planilhas excelentes! Economizei horas de trabalho.",
    avatar: "CM",
  },
  {
    name: "Ana Paula S.",
    location: "Rio de Janeiro, RJ",
    comment: "Muito completo, vale cada centavo. Recomendo!",
    avatar: "AP",
  },
  {
    name: "Roberto L.",
    location: "Belo Horizonte, MG",
    comment: "Melhor investimento para meu negócio esse ano.",
    avatar: "RL",
  },
];

export const MiniTestimonials = () => {
  return (
    <div className="space-y-3">
      {testimonials.map((testimonial, idx) => (
        <div key={idx} className="flex gap-3 items-start p-3 bg-muted/50 rounded-lg border border-border/50">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm shrink-0">
            {testimonial.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm">{testimonial.name}</span>
              <span className="text-xs text-muted-foreground">{testimonial.location}</span>
            </div>
            <div className="flex gap-0.5 mb-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3 w-3 fill-primary text-primary" />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">{testimonial.comment}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
