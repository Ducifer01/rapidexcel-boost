import Hero from "@/components/Hero";
import Benefits from "@/components/Benefits";
import DashboardShowcase from "@/components/DashboardShowcase";
import Categories from "@/components/Categories";
import Testimonials from "@/components/Testimonials";
import Offers from "@/components/Offers";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [youtubeVideoId, setYoutubeVideoId] = useState("SEU_VIDEO_ID");

  useEffect(() => {
    const loadYoutubeId = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'youtube_video_id')
          .single();

        if (!error && data) {
          setYoutubeVideoId(data.value);
        }
      } catch (error) {
        console.error('Error loading YouTube video ID:', error);
      }
    };

    loadYoutubeId();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Hero />
      
      {/* Seção de Demonstração em Vídeo */}
      <section className="py-12 md:py-20 bg-gradient-to-b from-background to-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-white">
              Veja Como Funciona
            </h2>
            <p className="text-lg text-center mb-8 text-slate-300">
              Assista à demonstração real de compra e entrega instantânea dos produtos
            </p>
            
            {/* Container do vídeo com aspect ratio 16:9 */}
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                className="absolute top-0 left-0 w-full h-full rounded-xl shadow-2xl"
                src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${youtubeVideoId}&modestbranding=1&rel=0`}
                title="Demonstração do PlanilhaExpress"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Badge de confiança */}
            <div className="flex items-center justify-center gap-4 mt-8 flex-wrap">
              <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
                ✓ Site 100% Seguro
              </Badge>
              <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                ✓ Entrega Imediata
              </Badge>
              <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                ✓ Garantia de 7 Dias
              </Badge>
            </div>
          </div>
        </div>
      </section>

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
