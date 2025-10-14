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
    <div className="space-y-2 sm:space-y-3">
      {testimonials.map((testimonial, idx) => (
        <div key={idx} className="flex gap-2 sm:gap-3 items-start p-2.5 sm:p-3 bg-muted/50 rounded-lg border border-border/50">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs sm:text-sm shrink-0">
            {testimonial.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2 mb-1">
              <span className="font-semibold text-xs sm:text-sm leading-tight">{testimonial.name}</span>
              <span className="text-[10px] sm:text-xs text-muted-foreground">{testimonial.location}</span>
            </div>
            <div className="flex gap-0.5 mb-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-primary text-primary" />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{testimonial.comment}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
