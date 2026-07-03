// TWENDE Soko Commerce v2 — Flash Sale Banner & Countdown
// Sprint 10: Marketplace

import { useState, useEffect } from 'react';
import { Zap, Timer } from 'lucide-react';
import type { FlashSale } from '../../soko/types';

interface FlashSaleBannerProps {
  flashSale: FlashSale;
  onClick?: () => void;
}

function useCountdown(targetDate: string) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isExpired: false,
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
}

export default function FlashSaleBanner({ flashSale, onClick }: FlashSaleBannerProps) {
  const timeLeft = useCountdown(flashSale.endsAt);

  if (timeLeft.isExpired || flashSale.status !== 'active') {
    return null;
  }

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <button
      onClick={onClick}
      className="w-full bg-gradient-to-r from-coral via-sunrise to-coral rounded-xl p-4 text-white shadow-lg hover:shadow-xl transition-all hover:scale-[1.01] text-left"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold flex items-center gap-2">
              {flashSale.name}
              <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                Up to {flashSale.discountPercentage}% OFF
              </span>
            </h3>
            <p className="text-xs text-white/80 mt-0.5">Limited quantities — grab them before they&apos;re gone!</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Timer className="w-4 h-4 text-white/80" />
          <div className="flex items-center gap-1">
            {timeLeft.days > 0 && (
              <span className="bg-white/20 rounded px-2 py-1 text-sm font-bold min-w-[36px] text-center">
                {pad(timeLeft.days)}d
              </span>
            )}
            <span className="bg-white/20 rounded px-2 py-1 text-sm font-bold min-w-[36px] text-center">
              {pad(timeLeft.hours)}
            </span>
            <span className="text-sm font-bold">:</span>
            <span className="bg-white/20 rounded px-2 py-1 text-sm font-bold min-w-[36px] text-center">
              {pad(timeLeft.minutes)}
            </span>
            <span className="text-sm font-bold">:</span>
            <span className="bg-white/20 rounded px-2 py-1 text-sm font-bold min-w-[36px] text-center">
              {pad(timeLeft.seconds)}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

export { useCountdown };
