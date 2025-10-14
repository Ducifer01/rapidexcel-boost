import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutos = 900 segundos

  useEffect(() => {
    // Tentar recuperar do localStorage
    const savedTime = localStorage.getItem('checkout_timer');
    const savedTimestamp = localStorage.getItem('checkout_timestamp');
    
    if (savedTime && savedTimestamp) {
      const elapsed = Math.floor((Date.now() - parseInt(savedTimestamp)) / 1000);
      const remaining = parseInt(savedTime) - elapsed;
      if (remaining > 0) {
        setTimeLeft(remaining);
      } else {
        localStorage.removeItem('checkout_timer');
        localStorage.removeItem('checkout_timestamp');
      }
    } else {
      localStorage.setItem('checkout_timer', '900');
      localStorage.setItem('checkout_timestamp', Date.now().toString());
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex items-center justify-center gap-2 bg-destructive/10 text-destructive px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-destructive/20">
      <Clock className="h-4 w-4 sm:h-5 sm:w-5 animate-pulse flex-shrink-0" />
      <span className="font-semibold text-xs sm:text-sm whitespace-nowrap">
        Oferta expira: {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  );
};
