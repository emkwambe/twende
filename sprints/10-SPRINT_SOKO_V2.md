# Sprint 10: Soko Commerce v2 (Marketplace)

## Sprint Metadata
| Field | Value |
|---|---|
| **Sprint ID** | SPRINT-10 |
| **Title** | Soko Commerce v2 (Marketplace) |
| **Duration** | 3 weeks |
| **Priority** | P1 — Revenue & Data |
| **Dependency** | SPRINT-05 (Credit Score), SPRINT-06 (Event Bus), SPRINT-07 (Biashara) |
| **Parallelizable** | Yes — marketplace and vendor tools separate |
| **Owner** | Full-Stack Team |

---

## 1. Objective

Transform Soko from a basic product catalog into a full **social commerce marketplace** — think "Shopify + WhatsApp Business for East Africa." This sprint adds: vendor storefronts with custom branding, WhatsApp-style social selling (share products to status/stories), logistics integration (motorcycle delivery), inventory management, flash sales, and the critical **Soko GMV → Biashara loan pre-qualification** pipeline that turns merchants into borrowers.

Soko becomes the data engine that feeds the Trust Engine with real sales performance data.

---

## 2. User Stories

### Story 10.1 — Create Vendor Storefront
> **As a** small business owner, **I want** to create a branded online store with my products, **so that** customers can discover and buy from me.

**Acceptance Criteria:**
- Store setup: store name, logo, banner image, description, location
- Custom storefront URL: `twende.app/s/[store-name]`
- Store themes: 5 pre-built templates (fashion, electronics, food, beauty, general)
- Business hours, delivery areas, return policy
- Store analytics: visitors, conversion rate, top products
- Store rating displayed (from customer reviews)
- "Verified Merchant" badge after KYC Tier 2 + 10 completed orders
- Store sharing: generate link/image for WhatsApp/Facebook

### Story 10.2 — Product Management
> **As a** vendor, **I want** to add, edit, and manage my products with photos, variants, and inventory tracking, **so that** my catalog is always up to date.

**Acceptance Criteria:**
- Add product: name, description, photos (up to 5), price, category, variants (size, color)
- Inventory tracking: stock quantity, low stock alerts (at 5 units)
- Bulk upload via CSV template
- Product status: active, out of stock, draft, archived
- Discount/sale pricing with start/end dates
- Product analytics: views, add-to-cart, purchases, conversion rate
- Search keywords and tags for discovery

### Story 10.3 — Customer Shopping Experience
> **As a** buyer, **I want** to browse products, add to cart, and checkout with M-Pesa, **so that** I can shop from local vendors easily.

**Acceptance Criteria:**
- Product discovery: search, categories, trending, nearby vendors
- Product page: photos, description, price, vendor info, reviews, delivery estimate
- Cart: add/remove items, quantity adjustment, promo code
- Checkout: delivery address, delivery method, M-Pesa STK Push payment
- Order tracking: placed → confirmed → shipped → delivered
- Order history with reorder option
- Save favorites/wishlist
- Share product to WhatsApp with image and link

### Story 10.4 — WhatsApp Social Selling
> **As a** vendor, **I want** to share my products to WhatsApp Status and groups with one tap, **so that** I can sell through my existing social networks.

**Acceptance Criteria:**
- "Share to WhatsApp" button on every product
- Generates product card image (product photo + price + store name)
- Pre-filled WhatsApp message with product link
- "WhatsApp Order" — customers can order by sending message to vendor's WhatsApp
- Vendor receives order notification with customer details
- Convert WhatsApp orders to formal Soko orders (vendor clicks "Create Order")
- Track which sales came from WhatsApp vs. app

### Story 10.5 — Delivery & Logistics
> **As a** vendor, **I want** to arrange delivery for orders through integrated motorcycle couriers, **so that** I don't need my own delivery fleet.

**Acceptance Criteria:**
- Delivery options: pickup, motorcycle courier, vendor delivery
- Courier integration: Sendy/Lori Systems API for motorcycle delivery
- Delivery fee calculated by distance (vendor can set free delivery threshold)
- Delivery tracking: pickup → in transit → delivered (GPS tracking)
- Delivery confirmation: customer PIN code or signature
- Delivery analytics: average time, cost, customer satisfaction
- Scheduled delivery: customer selects delivery time slot

### Story 10.6 — Flash Sales & Promotions
> **As a** vendor, **I want** to run time-limited flash sales with countdown timers, **so that** I can create urgency and drive sales.

**Acceptance Criteria:**
- Create flash sale: select products, discount %, start/end time, quantity limit
- Countdown timer displayed on product pages
- "X units left" scarcity indicator
- Flash sale section on home page
- Push notifications to followers when flash sale starts
- Sale performance analytics: revenue, units sold, new customers
- Auto-revert prices when sale ends

---

## 3. Technical Specification

### 3.1 Storefront Data Model

```typescript
interface VendorStorefront {
  id: string;
  userId: string;
  
  // Branding
  name: string;
  slug: string;                    // URL-friendly name
  logo: string;                    // image URL
  banner: string;                  // banner image URL
  description: string;
  theme: 'fashion' | 'electronics' | 'food' | 'beauty' | 'general';
  
  // Business info
  location: {
    lat: number;
    lng: number;
    address: string;
    ward: string;
  };
  businessHours: {
    day: string;
    open: string;
    close: string;
    isOpen: boolean;
  }[];
  deliveryAreas: string[];         // list of wards
  returnPolicy: string;
  
  // Status
  status: 'pending' | 'active' | 'suspended' | 'closed';
  isVerified: boolean;
  verificationDate?: Date;
  
  // Stats
  totalOrders: number;
  totalRevenue: number;
  rating: number;                  // 1-5 average
  reviewCount: number;
  followerCount: number;
  
  // Settings
  freeDeliveryThreshold: number;   // KES amount
  deliveryFee: number;             // base fee
  
  createdAt: Date;
  updatedAt: Date;
}
```

### 3.2 Order Lifecycle

```
CART → CHECKOUT_INITIATED → PAYMENT_PENDING → PAID → CONFIRMED 
                                                              ↓
DELIVERED ← OUT_FOR_DELIVERY ← PACKED ← PICKED_UP ← READY
   ↓
COMPLETED → REVIEWED

CANCELLATION paths:
- Any status before PAID → CANCELLED (no charge)
- PAID → REFUND_REQUESTED → REFUNDED (M-Pesa reversal)
- DELIVERED → RETURN_REQUESTED → RETURNED → REFUNDED
```

### 3.3 Database Schema

```sql
-- Vendor storefronts
CREATE TABLE vendor_storefronts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  logo VARCHAR(500),
  banner VARCHAR(500),
  description TEXT,
  theme VARCHAR(20) NOT NULL DEFAULT 'general',
  location JSONB NOT NULL,
  business_hours JSONB NOT NULL DEFAULT '[]',
  delivery_areas TEXT[] NOT NULL DEFAULT '{}',
  return_policy TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  free_delivery_threshold DECIMAL(10,2) DEFAULT 0,
  delivery_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storefront_id UUID NOT NULL REFERENCES vendor_storefronts(id),
  
  -- Product details
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  subcategory VARCHAR(50),
  
  -- Pricing
  price DECIMAL(10,2) NOT NULL,
  compare_at_price DECIMAL(10,2),   -- original price for sales
  cost_price DECIMAL(10,2),         -- for margin calculation
  
  -- Inventory
  sku VARCHAR(100),
  inventory_quantity INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER NOT NULL DEFAULT 5,
  track_inventory BOOLEAN NOT NULL DEFAULT TRUE,
  
  -- Media
  images JSONB NOT NULL DEFAULT '[]',
  
  -- Variants
  has_variants BOOLEAN NOT NULL DEFAULT FALSE,
  variants JSONB DEFAULT '[]',      -- [{ size, color, price, quantity }]
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'out_of_stock', 'draft', 'archived')),
  
  -- Discovery
  tags TEXT[] DEFAULT '{}',
  search_keywords TEXT,
  
  -- Stats
  view_count INTEGER NOT NULL DEFAULT 0,
  add_to_cart_count INTEGER NOT NULL DEFAULT 0,
  purchase_count INTEGER NOT NULL DEFAULT 0,
  
  -- Sale
  is_on_sale BOOLEAN NOT NULL DEFAULT FALSE,
  sale_starts_at TIMESTAMPTZ,
  sale_ends_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES users(id),
  storefront_id UUID NOT NULL REFERENCES vendor_storefronts(id),
  
  -- Items
  items JSONB NOT NULL,             -- [{ productId, name, price, quantity, variant? }]
  subtotal DECIMAL(10,2) NOT NULL,
  delivery_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  
  -- Delivery
  delivery_address JSONB NOT NULL,
  delivery_method VARCHAR(20) NOT NULL,
  delivery_status VARCHAR(20),
  delivery_tracking_id VARCHAR(100),
  estimated_delivery_date DATE,
  delivered_at TIMESTAMPTZ,
  
  -- Payment
  payment_method VARCHAR(20) NOT NULL DEFAULT 'mpesa',
  payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  payment_reference VARCHAR(100),
  paid_at TIMESTAMPTZ,
  
  -- Order status
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'confirmed', 'ready', 'picked_up', 
                      'out_for_delivery', 'delivered', 'completed', 'cancelled', 
                      'refund_requested', 'refunded', 'returned')),
  
  -- Source tracking
  source VARCHAR(20) NOT NULL DEFAULT 'app',  -- 'app', 'whatsapp', 'direct'
  
  -- Promo
  promo_code VARCHAR(50),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reviews
CREATE TABLE product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  order_id UUID NOT NULL REFERENCES orders(id),
  customer_id UUID NOT NULL REFERENCES users(id),
  storefront_id UUID NOT NULL REFERENCES vendor_storefronts(id),
  
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  photos JSONB DEFAULT '[]',
  
  -- Vendor response
  vendor_response TEXT,
  vendor_responded_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Flash sales
CREATE TABLE flash_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storefront_id UUID NOT NULL REFERENCES vendor_storefronts(id),
  name VARCHAR(100) NOT NULL,
  
  -- Products on sale
  product_ids UUID[] NOT NULL,
  discount_percentage DECIMAL(5,2) NOT NULL,
  
  -- Timing
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  
  -- Limits
  quantity_limit INTEGER,           // per product
  total_quantity_sold INTEGER NOT NULL DEFAULT 0,
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'active', 'ended', 'cancelled')),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 3.4 API Endpoints

```yaml
# Storefront Management
POST /api/v1/soko/storefronts
  Body: { name, description, location, theme }
  Response: { storefrontId, slug, setupComplete }

PUT /api/v1/soko/storefronts/:id
  Body: partial update

GET /api/v1/soko/storefronts/:slug
  Response: { storefront, products, stats, reviews }
  
# Product Management
POST /api/v1/soko/products
  Body: { storefrontId, name, description, price, images[], inventory, category }
  
PUT /api/v1/soko/products/:id
DELETE /api/v1/soko/products/:id

GET /api/v1/soko/products
  Query: { storefrontId?, category?, search?, sort?, page? }

# Shopping & Cart
POST /api/v1/soko/cart/items
  Body: { productId, quantity, variant? }
  
GET /api/v1/soko/cart
PUT /api/v1/soko/cart/items/:id
DELETE /api/v1/soko/cart/items/:id

# Orders
POST /api/v1/soko/orders
  Body: { items[], deliveryAddress, deliveryMethod, promoCode? }
  
GET /api/v1/soko/orders
GET /api/v1/soko/orders/:id

POST /api/v1/soko/orders/:id/pay
  Response: { stkPushSent: true, checkoutRequestId }

# Vendor Order Management
GET /api/v1/soko/vendor/orders
PUT /api/v1/soko/vendor/orders/:id/status
  Body: { status, trackingId? }

# Reviews
POST /api/v1/soko/reviews
  Body: { orderId, productId, rating, reviewText, photos[] }

# Flash Sales
POST /api/v1/soko/flash-sales
  Body: { name, productIds[], discountPercentage, startsAt, endsAt, quantityLimit? }
  
GET /api/v1/soko/flash-sales/active
```

---

## 4. Implementation Guardrails

### 4.1 MUST NOT

- **NEVER** process payments without inventory check — prevent overselling
- **NEVER** allow vendors to see customer payment details — only order info
- **NEVER** process refunds without order status verification
- **NEVER** display out-of-stock products in search results
- **NEVER** allow unverified vendors to sell high-value items (>KES 50,000)
- **NEVER** share customer phone numbers with vendors — in-app messaging only
- **NEVER** process M-Pesa STK Push without idempotency key
- **NEVER** allow fake reviews — verified purchase required to review

### 4.2 MUST

- **MUST** decrement inventory atomically on order creation (transaction)
- **MUST** send order notifications to vendor within 30 seconds
- **MUST** auto-cancel unpaid orders after 30 minutes
- **MUST** verify vendor KYC (Tier 2) before allowing sales
- **MUST** calculate and publish Soko GMV to Trust Engine daily
- **MUST** integrate with Biashara for merchant pre-qualification (GMV > KES 50K/month)
- **MUST** provide in-app chat between customer and vendor (no phone sharing)
- **MUST** track order source (app vs WhatsApp) for analytics
- **MUST** implement cart abandonment recovery (push notification after 1 hour)
- **MUST** generate product share images server-side (Canvas/Sharp)

### 4.3 GMV → LOAN PIPELINE

| Trigger | Condition | Action |
|---------|-----------|--------|
| Monthly GMV > KES 50K | 3 consecutive months | Publish `soko.merchant.prequalified` event |
| Order completion | Every order | Update merchant GMV metrics |
| Daily batch | Midnight | Recalculate all merchant metrics, push to Trust Engine |

---

## 5. Deliverables Checklist

- [ ] Vendor storefront creation with custom branding
- [ ] 5 store themes (fashion, electronics, food, beauty, general)
- [ ] Product management (CRUD + variants + inventory)
- [ ] Product catalog with search, filters, categories
- [ ] Shopping cart with promo code support
- [ ] M-Pesa STK Push checkout
- [ ] Order lifecycle management (11 states)
- [ ] Order tracking for customers
- [ ] Vendor order management dashboard
- [ ] WhatsApp social selling (share product cards)
- [ ] WhatsApp order conversion flow
- [ ] Delivery integration (courier API)
- [ ] Delivery tracking with GPS
- [ ] Flash sales with countdown timer
- [ ] Product review system (verified purchase required)
- [ ] Store analytics (visitors, conversion, revenue)
- [ ] In-app customer-vendor messaging
- [ ] Cart abandonment notifications
- [ ] Product share image generation
- [ ] GMV tracking and Trust Engine integration
- [ ] Merchant pre-qualification for Biashara loans

---

## 6. Definition of Done

- [ ] Vendor can create branded storefront in <5 minutes
- [ ] Customer can browse, add to cart, and checkout with M-Pesa
- [ ] Inventory decrements atomically on order creation
- [ ] Order notifications delivered to vendor within 30 seconds
- [ ] WhatsApp sharing generates product card images
- [ ] Flash sales display countdown timer and scarcity indicators
- [ ] Delivery tracking shows real-time status updates
- [ ] Reviews require verified purchase
- [ ] Store analytics show accurate visitor and conversion data
- [ ] GMV data feeds Trust Engine for credit scoring
- [ ] Merchants with >KES 50K monthly GMV get pre-qualified for loans
- [ ] Unpaid orders auto-cancel after 30 minutes
- [ ] Cart abandonment push notifications sent after 1 hour
- [ ] In-app messaging works between customers and vendors
