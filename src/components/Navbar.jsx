import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Lock, Sparkles, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { totalItems } = useCart();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#F2E5D9]/80 shadow-[0_2px_15px_-3px_rgba(66,32,16,0.04)]">
      {/* Top announcement micro-banner */}
      <div className="bg-gradient-to-r from-[#E85D88] via-[#FB7185] to-[#E85D88] text-white text-[11px] sm:text-xs font-bold py-1.5 px-4 text-center flex items-center justify-center gap-2 shadow-xs">
        <Sparkles className="w-3.5 h-3.5 animate-pulse" />
        <span>Feito com amor, em cada colherada! • Pedidos diretos no WhatsApp 🍰</span>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-[#E86A8D]/40 shadow-md shadow-[#E86A8D]/20 group-hover:scale-105 transition-all duration-300 bg-white shrink-0 p-0.5">
            <img src="/logo.jpg" alt="Amor em Pote" className="w-full h-full object-cover rounded-full" />
          </div>
          <div>
            <span className="font-pacifico text-2xl sm:text-3xl text-[#3D2314] tracking-wide block leading-none">
              Amor em Pote
            </span>
            <span className="text-[10px] sm:text-[11px] font-black text-[#A05A36] tracking-[0.2em] uppercase mt-0.5 block">
              Doces Artesanais
            </span>
          </div>
        </Link>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {!isAdmin ? (
            <>
              {/* Cart Button */}
              <Link
                to="/carrinho"
                className="relative flex items-center gap-2.5 bg-[#FFFDF9] hover:bg-[#FDF2F4] border border-[#F2E5D9] text-[#2C1810] px-4 py-2 sm:py-2.5 rounded-full font-extrabold text-xs sm:text-sm transition-all duration-200 shadow-xs hover:shadow-md hover:border-[#E85D88]/40 active:scale-95 group"
                aria-label="Meu Carrinho"
              >
                <div className="relative">
                  <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-[#E85D88] group-hover:scale-110 transition-transform" />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[#E85D88] text-white text-[10px] font-black rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center ring-2 ring-white animate-bounce">
                      {totalItems}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline">Carrinho</span>
                {totalItems > 0 && (
                  <span className="hidden sm:inline text-xs text-[#A05A36]">
                    ({totalItems})
                  </span>
                )}
              </Link>

              {/* Admin Link */}
              <Link
                to="/admin"
                className="flex items-center gap-1.5 text-xs font-bold text-[#A05A36]/80 hover:text-[#E85D88] px-2.5 py-2 rounded-xl hover:bg-[#FDF2F4] transition-colors"
                title="Painel do Confeiteiro"
              >
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Admin</span>
              </Link>
            </>
          ) : (
            <Link
              to="/"
              className="flex items-center gap-2 bg-[#FFFDF9] hover:bg-[#FDF2F4] text-[#E85D88] border border-[#F2E5D9] px-4 py-2 rounded-full text-xs font-black shadow-xs transition-colors hover:border-[#E85D88]"
            >
              <span>Ver Loja</span>
              <span className="text-sm">🧁</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
