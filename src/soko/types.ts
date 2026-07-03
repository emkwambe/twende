// TWENDE Soko Commerce v2 — TypeScript Types
// Sprint 10: Marketplace

export type StoreTheme = 'fashion' | 'electronics' | 'food' | 'beauty' | 'general';
export type ProductStatus = 'active' | 'out_of_stock' | 'draft' | 'archived';
export type OrderStatus = 'pending' | 'paid' | 'confirmed' | 'ready' | 'picked_up' | 'out_for_delivery' | 'delivered' | 'completed' | 'cancelled' | 'refund_requested' | 'refunded' | 'returned';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type DeliveryMethod = 'pickup' | 'vendor_delivery' | 'courier';
export type OrderSource = 'app' | 'whatsapp' | 'direct';
export type FlashSaleStatus = 'scheduled' | 'active' | 'ended' | 'cancelled';

export interface VendorStorefront {
  id: string;
  userId: string;
  name: string;
  slug: string;
  logo: string;
  banner: string;
  description: string;
  theme: StoreTheme;
  location: {
    lat: number;
    lng: number;
    address: string;
    ward: string;
  };
  businessHours: Array<{
    day: string;
    open: string;
    close: string;
    isOpen: boolean;
  }>;
  deliveryAreas: string[];
  returnPolicy: string;
  status: 'pending' | 'active' | 'suspended' | 'closed';
  isVerified: boolean;
  totalOrders: number;
  totalRevenue: number;
  rating: number;
  reviewCount: number;
  followerCount: number;
  freeDeliveryThreshold: number;
  deliveryFee: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  name: string;
  options: Array<{
    value: string;
    priceAdjustment: number;
    quantity: number;
  }>;
}

export interface SokoProduct {
  id: string;
  storefrontId: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  inventory: number;
  sku?: string;
  tags: string[];
  status: ProductStatus;
  isOnSale: boolean;
  saleStartsAt?: string;
  saleEndsAt?: string;
  variants?: ProductVariant[];
  viewCount: number;
  addToCartCount: number;
  purchaseCount: number;
}

export interface CartItem {
  productId: string;
  quantity: number;
  variant?: {
    name: string;
    value: string;
  };
}

export interface ShoppingCart {
  items: CartItem[];
  promoCode: string | null;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  variant?: string;
  image?: string;
}

export interface SokoOrder {
  id: string;
  customerId: string;
  storefrontId: string;
  storefrontName?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  deliveryAddress: {
    name: string;
    phone: string;
    address: string;
  };
  deliveryMethod: DeliveryMethod;
  deliveryStatus?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  paymentReference?: string;
  status: OrderStatus;
  source: OrderSource;
  promoCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  customerName: string;
  rating: number;
  reviewText: string;
  photos: string[];
  verifiedPurchase: boolean;
  createdAt: string;
}

export interface FlashSale {
  id: string;
  name: string;
  productIds: string[];
  discountPercentage: number;
  startsAt: string;
  endsAt: string;
  status: FlashSaleStatus;
  quantityLimit?: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  productCount: number;
}
