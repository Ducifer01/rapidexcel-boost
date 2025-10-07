import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const TawkChat = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [propertyId, setPropertyId] = useState('');
  const [widgetId, setWidgetId] = useState('');

  useEffect(() => {
    const loadTawkSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('key, value')
          .in('key', ['tawk_enabled', 'tawk_property_id', 'tawk_widget_id']);

        if (error) {
          console.error('Error loading Tawk.to settings:', error);
          return;
        }

        const settings = data?.reduce((acc, setting) => {
          acc[setting.key] = setting.value;
          return acc;
        }, {} as Record<string, string>);

        if (settings) {
          setIsEnabled(settings.tawk_enabled === 'true');
          setPropertyId(settings.tawk_property_id || '');
          setWidgetId(settings.tawk_widget_id || '');
        }
      } catch (error) {
        console.error('Error loading Tawk.to settings:', error);
      }
    };

    loadTawkSettings();
  }, []);

  useEffect(() => {
    if (!isEnabled || !propertyId || !widgetId) return;

    // Check if Tawk script is already loaded
    if (document.getElementById('tawk-script')) return;

    // Create and inject Tawk.to script
    const script = document.createElement('script');
    script.id = 'tawk-script';
    script.async = true;
    script.src = `https://embed.tawk.to/${propertyId}/${widgetId}`;
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');

    const firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode?.insertBefore(script, firstScript);

    // Initialize Tawk_API
    (window as any).Tawk_API = (window as any).Tawk_API || {};
    (window as any).Tawk_LoadStart = new Date();

    return () => {
      // Cleanup: remove script when component unmounts
      const tawkScript = document.getElementById('tawk-script');
      if (tawkScript) {
        tawkScript.remove();
      }
    };
  }, [isEnabled, propertyId, widgetId]);

  return null;
};
