import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

declare global {
  interface Window {
    fbq?: (
      action: 'track' | 'trackCustom' | 'init',
      eventName: string,
      params?: Record<string, any>
    ) => void;
    _fbq?: any;
  }
}

export const useFacebookPixel = () => {
  const [pixelId, setPixelId] = useState<string | null>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const loadPixelConfig = async () => {
      try {
        const { data: settings } = await supabase
          .from('site_settings')
          .select('key, value')
          .in('key', ['facebook_pixel_id', 'fb_pixel_enabled']);

        let finalPixelId = '2708262289551049'; // Default fallback

        if (settings) {
          const pixelIdSetting = settings.find(s => s.key === 'facebook_pixel_id');
          const dbId = pixelIdSetting?.value;
          
          // Prioridade: banco → default
          if (dbId && dbId.trim()) {
            finalPixelId = dbId;
          }
        }

        setPixelId(finalPixelId);
        const hasWindowFbq = typeof window !== 'undefined' && !!window.fbq;
        setIsEnabled(hasWindowFbq);

        // Inicializar o pixel se disponível e ainda não inicializado
        if (hasWindowFbq && !isInitialized && finalPixelId) {
          window.fbq('init', finalPixelId);
          window.fbq('track', 'PageView');
          setIsInitialized(true);
          console.info('✅ Facebook Pixel initialized:', finalPixelId);
        }
      } catch (error) {
        console.error('Erro ao carregar configurações do Facebook Pixel:', error);
        // Fallback mesmo com erro
        const defaultId = '2708262289551049';
        setPixelId(defaultId);
        if (typeof window !== 'undefined' && window.fbq && !isInitialized) {
          setIsEnabled(true);
          window.fbq('init', defaultId);
          window.fbq('track', 'PageView');
          setIsInitialized(true);
        }
      }
    };

    loadPixelConfig();
  }, [isInitialized]);

  const trackEvent = (eventName: string, params?: Record<string, any>) => {
    if (isEnabled && pixelId && window.fbq) {
      try {
        window.fbq('track', eventName, params);
        console.log(`Facebook Pixel: ${eventName}`, params);
      } catch (error) {
        console.error('Erro ao rastrear evento do Facebook Pixel:', error);
      }
    }
  };

  const trackCustomEvent = (eventName: string, params?: Record<string, any>) => {
    if (isEnabled && pixelId && window.fbq) {
      try {
        window.fbq('trackCustom', eventName, params);
        console.log(`Facebook Pixel Custom: ${eventName}`, params);
      } catch (error) {
        console.error('Erro ao rastrear evento customizado do Facebook Pixel:', error);
      }
    }
  };

  return { trackEvent, trackCustomEvent, isEnabled, pixelId };
};
