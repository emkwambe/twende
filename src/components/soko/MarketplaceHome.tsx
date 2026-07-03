// TWENDE Soko Commerce v2 — Marketplace Home (Discovery Page)
// Sprint 10: Marketplace

import { useState, useMemo } from 'react';
import { TrendingUp, MapPin, ChevronRight, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import StoreCard from './StoreCard';
import FlashSaleBanner from './FlashSaleBanner';
import CategoryFilter from './CategoryFilter';
import ProductSearch from './ProductSearch';
import {
  vendorStorefronts,
  sokoProducts,
  sokoCategories,
  flashSale,
  sokoCart,
} from '../../data/mockData';

export default function MarketplaceHome() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(sokoCart.items.reduce((a, i) => a + i.quantity, 0));

  const filteredProducts = useMemo(() => {
    let products = sokoProducts.filter((p) => p.status === 'active');
    if (activeCategory !== 'all') {
      products = products.filter((p) => p.category === activeCategory);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          p.category.toLowerCase().includes(q)
      );
    }
    return products;
  }, [activeCategory, searchQuery]);

  const trendingProducts = useMemo(() => {
    return [...sokoProducts]
      .filter((p) => p.status === 'active')
      .sort((a, b) => b.viewCount + b.purchaseCount * 10 - (a.viewCount + a.purchaseCount * 10))
      .slice(0, 4);
  }, []);

  const flashSaleProducts = useMemo(() => {
    return sokoProducts.filter((p) => flashSale.productIds.includes(p.id) && p.status === 'active');
  }, []);

  const nearbyStores = useMemo(() => {
    return vendorStorefronts.filter((s) => s.status === 'active').slice(0, 3);
  }, []);

  const handleAddToCart = () => {
    setCartCount((c) => c + 1);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-soko" />
            Soko Marketplace
          </h1>
          <p className="text-text2 text-sm mt-1">Discover local vendors and great deals</p>
        </div>
        <Link
          to="/soko/cart"
          className="relative p-2.5 rounded-xl bg-surface border border-border hover:bg-bg transition-colors"
        >
          <ShoppingBag className="w-5 h-5 text-soko" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-soko text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Link>
      </div>

      {/* Search */}
      <ProductSearch
        products={sokoProducts}
        onSearch={setSearchQuery}
        onSelectProduct={(id) => {
          window.location.href = `/soko/product/${id}`;
        }}
        placeholder="Search products, brands, categories..."
      />

      {/* Flash Sale Banner */}
      <FlashSaleBanner
        flashSale={flashSale}
        onClick={() => {
          window.location.href = '/soko/flash-sale';
        }}
      />

      {/* Categories */}
      <CategoryFilter
        categories={sokoCategories}
        activeCategory={activeCategory}
        onSelect={setActiveCategory}
      />

      {/* Trending Products */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-text flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-soko" />
            Trending Now
          </h2>
          <Link to="/soko" className="text-xs text-soko font-medium flex items-center gap-1 hover:underline">
            View all <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {trendingProducts.map((product) => {
            const store = vendorStorefronts.find((s) => s.id === product.storefrontId);
            return (
              <ProductCard
                key={product.id}
                product={product}
                storeName={store?.name}
                storeSlug={store?.slug}
                onAddToCart={handleAddToCart}
                variant="compact"
              />
            );
          })}
        </div>
      </div>

      {/* Nearby Vendors */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-text flex items-center gap-2">
            <MapPin className="w-4 h-4 text-soko" />
            Nearby Vendors
          </h2>
          <Link to="/soko" className="text-xs text-soko font-medium flex items-center gap-1 hover:underline">
            View all <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {nearbyStores.map((store) => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>
      </div>

      {/* Flash Sale Products */}
      {flashSaleProducts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-text flex items-center gap-2">
              <span className="w-2 h-2 bg-coral rounded-full animate-pulse" />
              Flash Sale
            </h2>
            <Link to="/soko/flash-sale" className="text-xs text-soko font-medium flex items-center gap-1 hover:underline">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {flashSaleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                discountPercentage={flashSale.discountPercentage}
                onAddToCart={handleAddToCart}
                variant="flash"
              />
            ))}
          </div>
        </div>
      )}

      {/* All Products */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-text">
            {activeCategory === 'all' ? 'All Products' : `${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}`}
          </h2>
          <span className="text-xs text-text3">{filteredProducts.length} items</span>
        </div>
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => {
              const store = vendorStorefronts.find((s) => s.id === product.storefrontId);
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  storeName={store?.name}
                  storeSlug={store?.slug}
                  onAddToCart={handleAddToCart}
                  variant="compact"
                />
              );
            })}
          </div>
        ) : (
          <div className="bg-surface rounded-xl border border-border p-8 text-center">
            <ShoppingBag className="w-12 h-12 text-text3 mx-auto mb-3" />
            <p className="text-sm text-text3">No products found</p>
            <button
              onClick={() => {
                setActiveCategory('all');
                setSearchQuery('');
              }}
              className="mt-3 text-sm text-soko font-medium hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
