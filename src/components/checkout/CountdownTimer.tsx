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
    <div className="flex items-center gap-2 bg-destructive/10 text-destructive px-4 py-2 rounded-lg border border-destructive/20">
      <Clock className="h-5 w-5 animate-pulse" />
      <span className="font-semibold">
        Oferta expira em: {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  );
};
