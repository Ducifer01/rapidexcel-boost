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

        if (settings) {
          const pixelIdSetting = settings.find(s => s.key === 'facebook_pixel_id');
          const enabledSetting = settings.find(s => s.key === 'fb_pixel_enabled');

          const id = pixelIdSetting?.value;
          const enabled = enabledSetting?.value === 'true';

          setPixelId(id || null);
          setIsEnabled(enabled && !!id);

          // Inicializar o pixel se habilitado e ID disponível
          if (enabled && id && window.fbq && !isInitialized) {
            window.fbq('init', id);
            window.fbq('track', 'PageView');
            setIsInitialized(true);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar configurações do Facebook Pixel:', error);
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
