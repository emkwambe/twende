// TWENDE Soko Commerce v2 — Marketplace Page
// Sprint 10: Replaces old vendor-centric Soko with full marketplace

import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import MarketplaceHome from '../components/soko/MarketplaceHome';
import VendorStorefront from '../components/soko/VendorStorefront';
import ProductDetail from '../components/soko/ProductDetail';
import ShoppingCart from '../components/soko/ShoppingCart';
import CheckoutForm from '../components/soko/CheckoutForm';
import OrderTracker from '../components/soko/OrderTracker';
import FavoritesList from '../components/soko/FavoritesList';
import FlashSalePage from '../components/soko/FlashSalePage';

export default function Soko() {
  const location = useLocation();
  const isRoot = location.pathname === '/soko';

  return (
    <div className="animate-fade-in">
      <Routes>
        <Route index element={<MarketplaceHome />} />
        <Route path="store/:slug" element={<VendorStorefront />} />
        <Route path="product/:id" element={<ProductDetail />} />
        <Route path="cart" element={<ShoppingCart />} />
        <Route path="checkout" element={<CheckoutForm />} />
        <Route path="orders" element={<OrderTracker />} />
        <Route path="favorites" element={<FavoritesList />} />
        <Route path="flash-sale" element={<FlashSalePage />} />
        <Route path="*" element={<Navigate to="/soko" replace />} />
      </Routes>
    </div>
  );
}
