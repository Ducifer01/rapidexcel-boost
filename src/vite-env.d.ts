/// <reference types="vite/client" />

interface Window {
  fbq?: (
    action: 'track' | 'trackCustom' | 'init',
    eventName: string,
    params?: Record<string, any>
  ) => void;
  _fbq?: any;
  gtag?: (
    command: string,
    targetId: string,
    config?: Record<string, any>
  ) => void;
}
