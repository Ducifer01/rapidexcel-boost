import { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';

export const ViewCounter = () => {
  const [viewers, setViewers] = useState(237);

  useEffect(() => {
    const interval = setInterval(() => {
      setViewers((prev) => {
        const change = Math.floor(Math.random() * 11) - 5; // -5 a +5
        const newValue = prev + change;
        return Math.max(180, Math.min(350, newValue));
      });
    }, 5000 + Math.random() * 5000); // 5-10 segundos

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground text-xs sm:text-sm">
      <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-pulse flex-shrink-0" />
      <span className="whitespace-nowrap">{viewers} pessoas visualizando</span>
    </div>
  );
};
