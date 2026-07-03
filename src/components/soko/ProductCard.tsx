// TWENDE Soko Commerce v2 — Reusable Product Card
// Sprint 10: Marketplace

import { ShoppingCart, Heart, Share2, Star, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { SokoProduct } from '../../soko/types';
import { sokoFavorites } from '../../data/mockData';

interface ProductCardProps {
  product: SokoProduct;
  storeName?: string;
  storeSlug?: string;
  onAddToCart?: (productId: string) => void;
  onToggleFavorite?: (productId: string) => void;
  variant?: 'default' | 'compact' | 'flash';
  discountPercentage?: number;
}

export default function ProductCard({
  product,
  storeName,
  storeSlug,
  onAddToCart,
  onToggleFavorite,
  variant = 'default',
  discountPercentage,
}: ProductCardProps) {
  const isFavorite = sokoFavorites.includes(product.id);
  const isLowStock = product.inventory > 0 && product.inventory < 5;
  const isOutOfStock = product.inventory <= 0;

  const effectivePrice = discountPercentage
    ? Math.round(product.price * (1 - discountPercentage / 100))
    : product.price;

  const discount = discountPercentage || (product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart?.(product.id);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite?.(product.id);
  };

  if (variant === 'compact') {
    return (
      <Link to={`/soko/product/${product.id}`} className="block group">
        <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
          <div className="relative h-36 bg-gradient-to-br from-bg to-border flex items-center justify-center overflow-hidden">
            <div className="w-16 h-16 rounded-full bg-soko/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-soko/40">
                {product.name.charAt(0)}
              </span>
            </div>
            {discount > 0 && (
              <span className="absolute top-2 left-2 bg-coral text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                -{discount}%
              </span>
            )}
            {isLowStock && (
              <span className="absolute bottom-2 left-2 bg-sunrise text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                Only {product.inventory} left
              </span>
            )}
            <button
              onClick={handleToggleFavorite}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white transition-colors"
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-coral text-coral' : 'text-text3'}`} />
            </button>
          </div>
          <div className="p-3">
            <h4 className="text-sm font-semibold text-text truncate group-hover:text-soko transition-colors">
              {product.name}
            </h4>
            {storeName && (
              <p className="text-[10px] text-text3 mt-0.5 truncate">{storeName}</p>
            )}
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="text-sm font-bold text-text">KES {effectivePrice.toLocaleString()}</span>
              {product.compareAtPrice && product.compareAtPrice > effectivePrice && (
                <span className="text-[10px] text-text3 line-through">KES {product.compareAtPrice.toLocaleString()}</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'flash') {
    return (
      <Link to={`/soko/product/${product.id}`} className="block group">
        <div className="bg-surface rounded-xl border-2 border-sunrise/30 overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
          <div className="relative h-40 bg-gradient-to-br from-bg to-border flex items-center justify-center overflow-hidden">
            <div className="w-20 h-20 rounded-full bg-sunrise/10 flex items-center justify-center">
              <span className="text-3xl font-bold text-sunrise/40">
                {product.name.charAt(0)}
              </span>
            </div>
            <span className="absolute top-2 left-2 bg-coral text-white text-xs font-bold px-2.5 py-1 rounded-full">
              -{discount}%
            </span>
            {isLowStock && (
              <span className="absolute bottom-2 left-2 bg-sunrise text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                Only {product.inventory} left
              </span>
            )}
          </div>
          <div className="p-4">
            <h4 className="text-sm font-semibold text-text group-hover:text-sunrise transition-colors">
              {product.name}
            </h4>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-lg font-bold text-coral">KES {effectivePrice.toLocaleString()}</span>
              <span className="text-xs text-text3 line-through">KES {product.price.toLocaleString()}</span>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="w-full mt-3 py-2 bg-sunrise text-white rounded-lg text-sm font-medium hover:bg-sunrise-dark transition-colors disabled:bg-border disabled:text-text3 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </Link>
    );
  }

  // Default variant
  return (
    <Link to={`/soko/product/${product.id}`} className="block group">
      <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
        <div className="relative h-44 bg-gradient-to-br from-bg to-border flex items-center justify-center overflow-hidden">
          <div className="w-20 h-20 rounded-full bg-soko/10 flex items-center justify-center">
            <span className="text-3xl font-bold text-soko/40">
              {product.name.charAt(0)}
            </span>
          </div>
          {discount > 0 && (
            <span className="absolute top-3 left-3 bg-coral text-white text-xs font-bold px-2.5 py-1 rounded-full">
              -{discount}%
            </span>
          )}
          {isLowStock && (
            <span className="absolute bottom-3 left-3 bg-sunrise text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              Only {product.inventory} left
            </span>
          )}
          {isOutOfStock && (
            <span className="absolute top-3 right-3 bg-border text-text3 text-xs font-bold px-2.5 py-1 rounded-full">
              Out of Stock
            </span>
          )}
          <button
            onClick={handleToggleFavorite}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-coral text-coral' : 'text-text3'}`} />
          </button>
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-text truncate group-hover:text-soko transition-colors">
                {product.name}
              </h4>
              {storeName && storeSlug && (
                <Link
                  to={`/soko/store/${storeSlug}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-[10px] text-text3 hover:text-soko transition-colors mt-0.5 block"
                >
                  {storeName}
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-base font-bold text-text">KES {effectivePrice.toLocaleString()}</span>
            {product.compareAtPrice && product.compareAtPrice > effectivePrice && (
              <span className="text-xs text-text3 line-through">KES {product.compareAtPrice.toLocaleString()}</span>
            )}
          </div>
          <div className="flex items-center justify-between mt-3">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="flex-1 py-2 bg-soko text-white rounded-lg text-sm font-medium hover:bg-soko/80 transition-colors disabled:bg-border disabled:text-text3 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Share via WhatsApp
                const text = `Check out ${product.name} on TWENDE Soko! KES ${effectivePrice.toLocaleString()} — Shop now: https://twende.app/soko/product/${product.id}`;
                window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
              }}
              className="ml-2 p-2 border border-border rounded-lg text-text3 hover:text-fresh hover:border-fresh transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
