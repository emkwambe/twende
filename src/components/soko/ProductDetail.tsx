// TWENDE Soko Commerce v2 — Product Detail Page
// Sprint 10: Marketplace

import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronLeft, Heart, Share2, ShoppingCart, Star, CheckCircle,
  Minus, Plus, MessageCircle, Truck, Shield
} from 'lucide-react';
import type { ProductVariant } from '../../soko/types';
import {
  vendorStorefronts,
  sokoProducts,
  productReviews,
  sokoCart,
} from '../../data/mockData';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<Record<string, string>>({});
  const [isFavorite, setIsFavorite] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [cartCount, setCartCount] = useState(sokoCart.items.reduce((a, i) => a + i.quantity, 0));

  const product = sokoProducts.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <ShoppingCart className="w-16 h-16 text-text3 mb-4" />
        <h2 className="text-xl font-bold text-text">Product not found</h2>
        <Link to="/soko" className="mt-4 px-4 py-2 bg-soko text-white rounded-lg text-sm font-medium hover:bg-soko/80 transition-colors">
          Back to Marketplace
        </Link>
      </div>
    );
  }

  const store = vendorStorefronts.find((s) => s.id === product.storefrontId);
  const reviews = productReviews.filter((r) => r.productId === product.id);
  const avgRating = reviews.length > 0
    ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length
    : 0;

  const isLowStock = product.inventory > 0 && product.inventory < 5;
  const isOutOfStock = product.inventory <= 0;

  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    setCartCount((c) => c + quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const text = `Check out ${product.name} from ${store?.name || 'TWENDE Soko'}! Only KES ${product.price.toLocaleString()}. Shop now: https://twende.app/soko/product/${product.id}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const variantPriceAdjustment = product.variants
    ? Object.entries(selectedVariant).reduce((total, [variantName, optionValue]) => {
        const variant = product.variants?.find((v: ProductVariant) => v.name === variantName);
        const option = variant?.options.find((o) => o.value === optionValue);
        return total + (option?.priceAdjustment || 0);
      }, 0)
    : 0;

  const finalPrice = product.price + variantPriceAdjustment;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back Navigation */}
      <div className="flex items-center justify-between">
        <Link to="/soko" className="inline-flex items-center gap-1 text-sm text-text2 hover:text-soko transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Back to Marketplace
        </Link>
        <Link to="/soko/cart" className="relative p-2 rounded-xl bg-surface border border-border hover:bg-bg transition-colors">
          <ShoppingCart className="w-5 h-5 text-soko" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-soko text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Image Gallery */}
        <div className="space-y-3">
          <div className="bg-surface rounded-xl border border-border h-80 flex items-center justify-center overflow-hidden">
            <div className="w-32 h-32 rounded-full bg-soko/10 flex items-center justify-center">
              <span className="text-5xl font-bold text-soko/30">{product.name.charAt(0)}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {product.images.map((_, i) => (
              <button
                key={i}
                className="w-16 h-16 rounded-lg bg-surface border border-border flex items-center justify-center hover:border-soko transition-colors"
              >
                <span className="text-sm font-bold text-soko/30">{i + 1}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-4">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h1 className="text-xl font-bold text-text">{product.name}</h1>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="p-2 rounded-lg border border-border hover:bg-bg transition-colors"
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-coral text-coral' : 'text-text3'}`} />
                </button>
                <button
                  onClick={handleWhatsAppShare}
                  className="p-2 rounded-lg border border-border hover:bg-bg transition-colors"
                >
                  <Share2 className="w-4 h-4 text-fresh" />
                </button>
              </div>
            </div>
            {store && (
              <Link to={`/soko/store/${store.slug}`} className="text-sm text-soko hover:underline mt-1 inline-block">
                {store.name} {store.isVerified && <CheckCircle className="w-3.5 h-3.5 text-fresh inline" />}
              </Link>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < Math.round(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-border'}`}
                />
              ))}
            </div>
            <span className="text-sm text-text">{avgRating.toFixed(1)}</span>
            <span className="text-sm text-text3">({reviews.length} reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-text">KES {finalPrice.toLocaleString()}</span>
            {product.compareAtPrice && product.compareAtPrice > finalPrice && (
              <span className="text-lg text-text3 line-through">KES {product.compareAtPrice.toLocaleString()}</span>
            )}
            {discount > 0 && (
              <span className="bg-coral text-white text-xs font-bold px-2 py-0.5 rounded-full">
                -{discount}%
              </span>
            )}
          </div>

          {/* Inventory Badge */}
          <div>
            {isOutOfStock ? (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-border text-text3 text-xs font-medium rounded-full">
                Out of Stock
              </span>
            ) : isLowStock ? (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-sunrise/10 text-sunrise text-xs font-medium rounded-full">
                Only {product.inventory} left
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-fresh/10 text-fresh text-xs font-medium rounded-full">
                <CheckCircle className="w-3 h-3" /> In Stock
              </span>
            )}
          </div>

          {/* Variants */}
          {product.variants && product.variants.map((variant) => (
            <div key={variant.name}>
              <p className="text-sm font-medium text-text mb-2">{variant.name}</p>
              <div className="flex flex-wrap gap-2">
                {variant.options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedVariant((prev) => ({ ...prev, [variant.name]: option.value }))}
                    disabled={option.quantity <= 0}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedVariant[variant.name] === option.value
                        ? 'bg-soko text-white'
                        : option.quantity <= 0
                        ? 'bg-border text-text3 cursor-not-allowed'
                        : 'bg-surface border border-border text-text hover:border-soko'
                    }`}
                  >
                    {option.value}
                    {option.priceAdjustment !== 0 && (
                      <span className="ml-1 text-xs">
                        {option.priceAdjustment > 0 ? '+' : ''}KES {option.priceAdjustment.toLocaleString()}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Quantity */}
          <div>
            <p className="text-sm font-medium text-text mb-2">Quantity</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-2 rounded-lg border border-border hover:bg-bg transition-colors"
              >
                <Minus className="w-4 h-4 text-text2" />
              </button>
              <span className="text-lg font-bold text-text w-8 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.inventory, q + 1))}
                disabled={quantity >= product.inventory}
                className="p-2 rounded-lg border border-border hover:bg-bg transition-colors disabled:opacity-50"
              >
                <Plus className="w-4 h-4 text-text2" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                addedToCart
                  ? 'bg-fresh text-white'
                  : isOutOfStock
                  ? 'bg-border text-text3 cursor-not-allowed'
                  : 'bg-soko text-white hover:bg-soko/80'
              }`}
            >
              {addedToCart ? (
                <>
                  <CheckCircle className="w-4 h-4" /> Added to Cart
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" /> Add to Cart
                </>
              )}
            </button>
            <button
              onClick={handleWhatsAppShare}
              className="px-4 py-3 border border-fresh text-fresh rounded-xl text-sm font-medium hover:bg-fresh/10 transition-colors flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </button>
          </div>

          {/* Trust Badges */}
          <div className="flex items-center gap-4 pt-2 text-xs text-text3">
            <span className="flex items-center gap-1">
              <Truck className="w-3.5 h-3.5" /> Fast Delivery
            </span>
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" /> Buyer Protection
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Verified Seller
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-surface rounded-xl border border-border p-5">
        <h2 className="text-base font-semibold text-text mb-3">Description</h2>
        <p className="text-sm text-text2 leading-relaxed">{product.description}</p>
        <div className="flex flex-wrap gap-2 mt-3">
          {product.tags.map((tag) => (
            <span key={tag} className="px-2.5 py-1 bg-bg text-text3 text-xs rounded-full">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Reviews */}
      {reviews.length > 0 && (
        <div className="bg-surface rounded-xl border border-border p-5">
          <h2 className="text-base font-semibold text-text mb-3">
            Reviews ({reviews.length})
          </h2>
          <div className="space-y-3">
            {reviews.map((review) => (
              <div key={review.id} className="py-3 border-b border-border last:border-0">
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
