// TWENDE Soko Commerce v2 — Shopping Cart
// Sprint 10: Marketplace

import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart as CartIcon, Trash2, Minus, Plus, ArrowRight, Tag, X
} from 'lucide-react';
import {
  sokoProducts,
  vendorStorefronts,
  sokoCart as initialCart,
} from '../../data/mockData';

interface CartItemData {
  productId: string;
  quantity: number;
  variant?: { name: string; value: string };
}

export default function ShoppingCart() {
  const [cartItems, setCartItems] = useState<CartItemData[]>(initialCart.items);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');

  const cartProducts = cartItems.map((item) => ({
    item,
    product: sokoProducts.find((p) => p.id === item.productId),
  })).filter((cp): cp is { item: CartItemData; product: NonNullable<typeof cp.product> } => cp.product !== undefined);

  const subtotal = cartProducts.reduce((sum, { item, product }) => {
    const variantAdj = item.variant
      ? (product.variants?.find((v) => v.name === item.variant.name)?.options.find((o) => o.value === item.variant?.value)?.priceAdjustment || 0)
      : 0;
    return sum + (product.price + variantAdj) * item.quantity;
  }, 0);

  const deliveryFee = subtotal > 2000 ? 0 : 150;
  const discount = promoApplied ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal + deliveryFee - discount;

  const updateQuantity = (productId: string, delta: number) => {
    setCartItems((items) =>
      items.map((item) => {
        if (item.productId === productId) {
          const product = sokoProducts.find((p) => p.id === productId);
          const newQty = Math.max(1, Math.min(product?.inventory || 99, item.quantity + delta));
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const removeItem = (productId: string) => {
    setCartItems((items) => items.filter((item) => item.productId !== productId));
  };

  const applyPromo = () => {
    if (promoCode.toLowerCase() === 'twende10') {
      setPromoApplied(true);
      setPromoError('');
    } else {
      setPromoApplied(false);
      setPromoError('Invalid promo code');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text flex items-center gap-2">
            <CartIcon className="w-6 h-6 text-soko" />
            Shopping Cart
          </h1>
          <p className="text-text2 text-sm mt-1">{cartItems.length} items</p>
        </div>
        <Link to="/soko" className="text-sm text-soko font-medium hover:underline">
          Continue Shopping
        </Link>
      </div>

      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-surface rounded-xl border border-border">
          <CartIcon className="w-16 h-16 text-text3 mb-4" />
          <h2 className="text-xl font-bold text-text">Your cart is empty</h2>
          <p className="text-sm text-text3 mt-2">Add some products to get started</p>
          <Link to="/soko" className="mt-4 px-4 py-2 bg-soko text-white rounded-lg text-sm font-medium hover:bg-soko/80 transition-colors">
            Browse Marketplace
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3">
            {cartProducts.map(({ item, product }) => {
              const store = vendorStorefronts.find((s) => s.id === product.storefrontId);
              const variantAdj = item.variant
                ? (product.variants?.find((v) => v.name === item.variant?.name)?.options.find((o) => o.value === item.variant?.value)?.priceAdjustment || 0)
                : 0;
              const unitPrice = product.price + variantAdj;
              const itemTotal = unitPrice * item.quantity;

              return (
                <div key={item.productId} className="bg-surface rounded-xl border border-border p-4 flex gap-4">
                  <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-bg to-border flex items-center justify-center shrink-0">
                    <span className="text-lg font-bold text-soko/40">{product.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link to={`/soko/product/${product.id}`} className="text-sm font-semibold text-text hover:text-soko transition-colors">
                          {product.name}
                        </Link>
                        {store && (
                          <p className="text-xs text-text3 mt-0.5">{store.name}</p>
                        )}
                        {item.variant && (
                          <p className="text-xs text-text3">{item.variant.name}: {item.variant.value}</p>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="p-1.5 rounded-lg hover:bg-coral/10 text-text3 hover:text-coral transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.productId, -1)}
                          className="p-1.5 rounded-lg border border-border hover:bg-bg transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5 text-text2" />
                        </button>
                        <span className="text-sm font-bold text-text w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, 1)}
                          className="p-1.5 rounded-lg border border-border hover:bg-bg transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5 text-text2" />
                        </button>
                      </div>
                      <span className="text-sm font-bold text-text">KES {itemTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="bg-surface rounded-xl border border-border p-5 h-fit">
            <h2 className="text-base font-semibold text-text mb-4">Order Summary</h2>

            {/* Promo Code */}
            <div className="mb-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text3" />
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => {
                      setPromoCode(e.target.value);
                      setPromoError('');
                    }}
                    placeholder="Promo code"
                    className="w-full pl-10 pr-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-soko/50"
                  />
                </div>
                <button
                  onClick={applyPromo}
                  className="px-4 py-2 bg-soko text-white rounded-lg text-sm font-medium hover:bg-soko/80 transition-colors"
                >
                  Apply
                </button>
              </div>
              {promoApplied && (
                <p className="text-xs text-fresh mt-1 flex items-center gap-1">
                  <Tag className="w-3 h-3" /> 10% discount applied!
                </p>
              )}
              {promoError && (
                <p className="text-xs text-coral mt-1">{promoError}</p>
              )}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-text2">
                <span>Subtotal</span>
                <span>KES {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-text2">
                <span>Delivery</span>
                <span>{deliveryFee === 0 ? 'FREE' : `KES ${deliveryFee.toLocaleString()}`}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-fresh">
                  <span>Discount</span>
                  <span>-KES {discount.toLocaleString()}</span>
                </div>
              )}
              <div className="pt-2 border-t border-border flex justify-between text-base font-bold text-text">
                <span>Total</span>
                <span>KES {total.toLocaleString()}</span>
              </div>
            </div>

            <Link
              to="/soko/checkout"
              className="w-full mt-4 py-3 bg-soko text-white rounded-xl text-sm font-medium hover:bg-soko/80 transition-colors flex items-center justify-center gap-2"
            >
              Checkout with M-Pesa <ArrowRight className="w-4 h-4" />
            </Link>

            <p className="text-xs text-text3 text-center mt-3">
              Secure payment powered by M-Pesa
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
