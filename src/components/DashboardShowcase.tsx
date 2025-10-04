import dashboard1 from "@/assets/dashboard-1.png";
import dashboard2 from "@/assets/dashboard-2.png";
import dashboard3 from "@/assets/dashboard-3.png";
import dashboard4 from "@/assets/dashboard-4.png";

const DashboardShowcase = () => {
  const dashboards = [
    { src: dashboard1, alt: "Dashboard de Vendas - Análise completa de desempenho comercial" },
    { src: dashboard2, alt: "Painel de Orçamento - Controle financeiro pessoal" },
    { src: dashboard3, alt: "Dashboard de Vendas Verde - Visualização de dados de vendas" },
    { src: dashboard4, alt: "Dashboard de Produtos - Análise de faturamento por produto" }
  ];

  return (
    <section className="py-16 md:py-24 px-4 bg-background">
      <div className="container max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
            Veja a Qualidade das{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-glow">
              Nossas Planilhas
            </span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Dashboards profissionais e planilhas editáveis que vão transformar sua gestão
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {dashboards.map((dashboard, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl border-2 border-border hover:border-primary/50 transition-all duration-300 shadow-card hover:shadow-[0_12px_40px_-8px_hsl(var(--primary)/0.3)] transform hover:-translate-y-2"
            >
              <div className="aspect-video overflow-hidden bg-muted">
                <img
                  src={dashboard.src}
                  alt={dashboard.alt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-6">
                <p className="text-sm font-medium text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  {dashboard.alt}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground text-lg">
            E isso é apenas uma pequena amostra do que você vai receber! 🎉
          </p>
        </div>
      </div>
    </section>
  );
};

export default DashboardShowcase;
