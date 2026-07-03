// TWENDE Soko Commerce v2 — Store Card Component
// Sprint 10: Marketplace

import { Link } from 'react-router-dom';
import { Star, MapPin, CheckCircle, Users } from 'lucide-react';
import type { VendorStorefront } from '../../soko/types';

interface StoreCardProps {
  store: VendorStorefront;
  variant?: 'default' | 'compact' | 'horizontal';
}

export default function StoreCard({ store, variant = 'default' }: StoreCardProps) {
  const isOpen = store.businessHours.find(
    (h) => h.day === new Date().toLocaleDateString('en-US', { weekday: 'short' })
  )?.isOpen ?? false;

  if (variant === 'compact') {
    return (
      <Link to={`/soko/store/${store.slug}`} className="block group">
        <div className="bg-surface rounded-xl border border-border p-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-soko/20 to-soko/5 flex items-center justify-center shrink-0">
              <span className="text-lg font-bold text-soko">{store.name.charAt(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-semibold text-text truncate group-hover:text-soko transition-colors">
                  {store.name}
                </h4>
                {store.isVerified && (
                  <CheckCircle className="w-3.5 h-3.5 text-fresh shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs text-text">{store.rating}</span>
                <span className="text-[10px] text-text3">({store.reviewCount})</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'horizontal') {
    return (
      <Link to={`/soko/store/${store.slug}`} className="block group">
        <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all flex">
          <div className="w-32 h-32 bg-gradient-to-br from-soko/20 to-soko/5 flex items-center justify-center shrink-0">
            <span className="text-3xl font-bold text-soko/40">{store.name.charAt(0)}</span>
          </div>
          <div className="p-4 flex-1 flex flex-col justify-center">
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-semibold text-text group-hover:text-soko transition-colors">
                {store.name}
              </h4>
              {store.isVerified && (
                <CheckCircle className="w-3.5 h-3.5 text-fresh shrink-0" />
              )}
            </div>
            <p className="text-xs text-text3 mt-1 line-clamp-2">{store.description}</p>
            <div className="flex items-center gap-3 mt-2 text-[10px] text-text3">
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                {store.rating} ({store.reviewCount})
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {store.location.ward}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {store.followerCount}
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Default variant
  return (
    <Link to={`/soko/store/${store.slug}`} className="block group">
      <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
        <div className="relative h-28 bg-gradient-to-r from-soko/20 to-soko/5 flex items-center justify-center">
          <span className="text-4xl font-bold text-soko/30">{store.name.charAt(0)}</span>
          {isOpen && (
            <span className="absolute top-3 right-3 bg-fresh text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              Open
            </span>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-center gap-1.5">
            <h4 className="text-sm font-semibold text-text group-hover:text-soko transition-colors">
              {store.name}
            </h4>
            {store.isVerified && (
              <CheckCircle className="w-3.5 h-3.5 text-fresh shrink-0" />
            )}
          </div>
          <p className="text-xs text-text3 mt-1 line-clamp-2">{store.description}</p>
          <div className="flex items-center gap-3 mt-3 text-[10px] text-text3">
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              {store.rating} ({store.reviewCount})
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {store.location.ward}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-[10px] text-text3">
            <span>{store.totalOrders} orders</span>
            <span>Free delivery over KES {store.freeDeliveryThreshold.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
