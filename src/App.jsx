import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Client pages
import Home from './pages/client/Home';
import Cart from './pages/client/Cart';
import Checkout from './pages/client/Checkout';
import OrderConfirmation from './pages/client/OrderConfirmation';

// Admin pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminStock from './pages/admin/AdminStock';
import AdminOrders from './pages/admin/AdminOrders';
import AdminSettings from './pages/admin/AdminSettings';

function ClientWrapper({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          {/* CLIENT ROUTES */}
          <Route path="/" element={<ClientWrapper><Home /></ClientWrapper>} />
          <Route path="/carrinho" element={<ClientWrapper><Cart /></ClientWrapper>} />
          <Route path="/checkout" element={<ClientWrapper><Checkout /></ClientWrapper>} />
          <Route path="/confirmacao/:orderId" element={<ClientWrapper><OrderConfirmation /></ClientWrapper>} />

          {/* ADMIN LOGIN */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* ADMIN PROTECTED ROUTES */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="estoque" element={<AdminStock />} />
            <Route path="pedidos" element={<AdminOrders />} />
            <Route path="configuracoes" element={<AdminSettings />} />
          </Route>

          {/* Fallback redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}
