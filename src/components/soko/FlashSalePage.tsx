// TWENDE Soko Commerce v2 — Flash Sale Page
// Sprint 10: Marketplace

import { Zap, Timer } from 'lucide-react';
import ProductCard from './ProductCard';
import FlashSaleBanner, { useCountdown } from './FlashSaleBanner';
import {
  sokoProducts,
  flashSale,
} from '../../data/mockData';

export default function FlashSalePage() {
  const timeLeft = useCountdown(flashSale.endsAt);
  const flashProducts = sokoProducts.filter((p) => flashSale.productIds.includes(p.id) && p.status === 'active');

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (timeLeft.isExpired || flashSale.status !== 'active') {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <Timer className="w-16 h-16 text-text3 mb-4" />
        <h2 className="text-xl font-bold text-text">Flash Sale Ended</h2>
        <p className="text-sm text-text3 mt-2">Check back soon for the next sale!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-coral via-sunrise to-coral rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{flashSale.name}</h1>
            <p className="text-sm text-white/80">Up to {flashSale.discountPercentage}% off selected items</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Timer className="w-4 h-4 text-white/80" />
          <span className="text-sm text-white/80">Ends in:</span>
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

      {/* Products Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-text">Flash Sale Items</h2>
          <span className="text-xs text-text3">{flashProducts.length} products</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {flashProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              discountPercentage={flashSale.discountPercentage}
              variant="flash"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
