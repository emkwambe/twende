// TWENDE Soko Commerce v2 — Vendor Storefront (Public Page)
// Sprint 10: Marketplace

import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star, MapPin, Clock, CheckCircle, Users, Phone, Share2, Heart,
  ChevronLeft, ShoppingBag
} from 'lucide-react';
import ProductCard from './ProductCard';
import CategoryFilter from './CategoryFilter';
import {
  vendorStorefronts,
  sokoProducts,
  productReviews,
  sokoCategories,
} from '../../data/mockData';

export default function VendorStorefront() {
  const { slug } = useParams<{ slug: string }>();
  const [activeCategory, setActiveCategory] = useState('all');
  const [isFollowing, setIsFollowing] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const store = vendorStorefronts.find((s) => s.slug === slug);

  if (!store) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <ShoppingBag className="w-16 h-16 text-text3 mb-4" />
        <h2 className="text-xl font-bold text-text">Store not found</h2>
        <p className="text-sm text-text3 mt-2">This vendor doesn&apos;t exist or has been removed.</p>
        <Link to="/soko" className="mt-4 px-4 py-2 bg-soko text-white rounded-lg text-sm font-medium hover:bg-soko/80 transition-colors">
          Back to Marketplace
        </Link>
      </div>
    );
  }

  const storeProducts = sokoProducts.filter(
    (p) => p.storefrontId === store.id && p.status === 'active'
  );

  const filteredProducts = activeCategory === 'all'
    ? storeProducts
    : storeProducts.filter((p) => p.category === activeCategory);

  const storeReviews = productReviews.filter((r) =>
    storeProducts.some((p) => p.id === r.productId)
  );

  const today = new Date().toLocaleDateString('en-US', { weekday: 'short' });
  const todayHours = store.businessHours.find((h) => h.day === today);
  const isOpen = todayHours?.isOpen ?? false;

  const handleAddToCart = () => setCartCount((c) => c + 1);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back Navigation */}
      <Link to="/soko" className="inline-flex items-center gap-1 text-sm text-text2 hover:text-soko transition-colors">
        <ChevronLeft className="w-4 h-4" />
        Back to Marketplace
      </Link>

      {/* Store Banner */}
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-soko/20 to-soko/5 h-32 flex items-center justify-center">
        <span className="text-6xl font-bold text-soko/20">{store.name.charAt(0)}</span>
      </div>

      {/* Store Info */}
      <div className="flex items-start gap-4 -mt-8 relative px-4">
        <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-soko to-soko/60 flex items-center justify-center text-white text-2xl font-bold shadow-lg border-4 border-surface">
          {store.name.charAt(0)}
        </div>
        <div className="flex-1 pt-8">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-text">{store.name}</h1>
            {store.isVerified && <CheckCircle className="w-5 h-5 text-fresh" />}
          </div>
          <div className="flex items-center gap-3 mt-1 text-sm text-text2">
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              {store.rating} ({store.reviewCount} reviews)
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {store.location.ward}, Nairobi
            </span>
            <span className={`flex items-center gap-1 ${isOpen ? 'text-fresh' : 'text-coral'}`}>
              <Clock className="w-4 h-4" />
              {isOpen ? 'Open' : 'Closed'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 pt-8">
          <button
            onClick={() => setIsFollowing(!isFollowing)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isFollowing
                ? 'bg-surface border border-border text-text2'
                : 'bg-soko text-white hover:bg-soko/80'
            }`}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
          <button
            onClick={() => {
              const text = `Check out ${store.name} on TWENDE Soko! ${store.description} — https://twende.app/soko/store/${store.slug}`;
              window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
            }}
            className="p-2 rounded-lg border border-border hover:bg-bg transition-colors"
          >
            <Share2 className="w-4 h-4 text-text2" />
          </button>
        </div>
      </div>

      {/* Description & Details */}
      <div className="bg-surface rounded-xl border border-border p-5">
        <p className="text-sm text-text2">{store.description}</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-border">
          <div className="text-center">
            <p className="text-lg font-bold text-text">{store.totalOrders}</p>
            <p className="text-xs text-text3">Orders</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-text">{store.followerCount}</p>
            <p className="text-xs text-text3">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-text">KES {(store.totalRevenue / 1000).toFixed(0)}K</p>
            <p className="text-xs text-text3">Revenue</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-text">{storeProducts.length}</p>
            <p className="text-xs text-text3">Products</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-border text-xs text-text3 space-y-1">
          <p className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {store.location.address}</p>
          <p className="flex items-center gap-1"><Phone className="w-3 h-3" /> Contact via in-app messaging</p>
          <p>Free delivery on orders over KES {store.freeDeliveryThreshold.toLocaleString()}</p>
          <p>Return policy: {store.returnPolicy}</p>
        </div>
      </div>

      {/* Products */}
      <div>
        <h2 className="text-base font-semibold text-text mb-3">Products</h2>
        <CategoryFilter
          categories={sokoCategories}
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
        />
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
              variant="compact"
            />
          ))}
        </div>
        {filteredProducts.length === 0 && (
          <div className="text-center py-8 text-text3 text-sm">No products in this category</div>
        )}
      </div>

      {/* Reviews */}
      {storeReviews.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-text mb-3">Reviews</h2>
          <div className="space-y-3">
            {storeReviews.map((review) => (
              <div key={review.id} className="bg-surface rounded-xl border border-border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-ocean/10 flex items-center justify-center text-xs font-bold text-ocean">
                    {review.customerName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text">{review.customerName}</p>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-border'}`}
                        />
                      ))}
                    </div>
                  </div>
                  {review.verifiedPurchase && (
                    <span className="ml-auto text-[10px] bg-fresh/10 text-fresh px-2 py-0.5 rounded-full font-medium">
                      Verified Purchase
                    </span>
                  )}
                </div>
                <p className="text-sm text-text2">{review.reviewText}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
