import Hero from "@/components/Hero";
import Benefits from "@/components/Benefits";
import DashboardShowcase from "@/components/DashboardShowcase";
import Categories from "@/components/Categories";
import Testimonials from "@/components/Testimonials";
import Offers from "@/components/Offers";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <Benefits />
      <DashboardShowcase />
      <Categories />
      <Testimonials />
      <Offers />
      <FAQ />
      <Footer />
    </div>
  );
};

export default Index;
