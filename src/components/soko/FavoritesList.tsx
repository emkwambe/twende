// TWENDE Soko Commerce v2 — Favorites / Wishlist
// Sprint 10: Marketplace

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, X } from 'lucide-react';
import ProductCard from './ProductCard';
import { sokoProducts, sokoFavorites } from '../../data/mockData';

export default function FavoritesList() {
  const [favorites, setFavorites] = useState(sokoFavorites);

  const favoriteProducts = sokoProducts.filter((p) => favorites.includes(p.id) && p.status === 'active');

  const handleToggleFavorite = (productId: string) => {
    setFavorites((prev) => prev.filter((id) => id !== productId));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text flex items-center gap-2">
          <Heart className="w-6 h-6 text-coral" />
          Favorites
        </h1>
        <p className="text-text2 text-sm mt-1">{favoriteProducts.length} saved items</p>
      </div>

      {favoriteProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-surface rounded-xl border border-border">
          <Heart className="w-16 h-16 text-text3 mb-4" />
          <h2 className="text-xl font-bold text-text">No favorites yet</h2>
          <p className="text-sm text-text3 mt-2">Save items you love to buy later</p>
          <Link to="/soko" className="mt-4 px-4 py-2 bg-soko text-white rounded-lg text-sm font-medium hover:bg-soko/80 transition-colors">
            Browse Marketplace
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {favoriteProducts.map((product) => (
            <div key={product.id} className="relative">
              <button
                onClick={() => handleToggleFavorite(product.id)}
                className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/80 hover:bg-white transition-colors"
              >
                <X className="w-3.5 h-3.5 text-coral" />
              </button>
              <ProductCard
                product={product}
                onToggleFavorite={handleToggleFavorite}
                variant="compact"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
