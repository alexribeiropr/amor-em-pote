import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ClipboardList, Settings, LogOut, Store, Sparkles } from 'lucide-react';
import { api } from '../../services/api';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState({ pendingOrders: 0, lowStockCount: 0 });

  useEffect(() => {
    const isAuth = sessionStorage.getItem('amor_admin_auth');
    if (isAuth !== 'true') {
      navigate('/admin/login');
      return;
    }

    loadBadges();
    const timer = setInterval(loadBadges, 15000);
    return () => clearInterval(timer);
  }, [navigate, location.pathname]);

  const loadBadges = async () => {
    try {
      const data = await api.getDashboard();
      setStats({
        pendingOrders: data.pendingOrders || 0,
        lowStockCount: data.lowStockCount || 0
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('amor_admin_auth');
    navigate('/admin/login');
  };

  const navLinks = [
    {
      to: '/admin/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      to: '/admin/pedidos',
      label: 'Gestão de Pedidos',
      icon: ClipboardList,
      badge: stats.pendingOrders > 0 ? stats.pendingOrders : null,
      badgeColor: 'bg-amber-500'
    },
    {
      to: '/admin/estoque',
      label: 'Estoque & Sabores',
      icon: Package,
      badge: stats.lowStockCount > 0 ? `${stats.lowStockCount} baixo` : null,
      badgeColor: 'bg-rose-500'
    },
    {
      to: '/admin/configuracoes',
      label: 'Configurações',
      icon: Settings,
      badge: null
    }
  ];

  return (
    <div className="min-h-screen bg-[#FFFDF9] flex flex-col text-[#2C1810]">
      {/* Top Admin Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-[#F2E5D9] sticky top-0 z-30 shadow-[0_2px_15px_-3px_rgba(66,32,16,0.03)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-[#E86A8D]/40 shadow-md bg-white shrink-0 p-0.5">
              <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover rounded-full" />
            </div>
            <div>
              <span className="font-black text-base sm:text-lg text-[#2C1810] block leading-tight">
                Painel do Confeiteiro
              </span>
              <span className="text-[10px] sm:text-[11px] font-black text-[#E85D88] uppercase tracking-widest">
                Amor em Pote
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-1.5 text-xs font-black text-[#7C4A2D] hover:text-[#2C1810] bg-[#FFFDF9] hover:bg-[#FDF2F4] border border-[#F2E5D9] px-3.5 py-2 rounded-2xl transition-all shadow-xs"
            >
              <Store className="w-4 h-4 text-[#E85D88]" />
              <span className="hidden sm:inline">Ver Cardápio do Cliente</span>
            </button>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3.5 py-2 rounded-2xl transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-t border-[#F2E5D9] bg-[#FFFDF9]/80 overflow-x-auto no-scrollbar">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-2 py-2">
            {navLinks.map(link => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all shrink-0 ${
                      isActive
                        ? 'bg-[#E85D88] text-white shadow-md shadow-[#E85D88]/20 scale-102'
                        : 'text-[#7C4A2D] hover:text-[#2C1810] hover:bg-white border border-transparent hover:border-[#F2E5D9]'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className={`text-[10px] text-white font-black px-2 py-0.5 rounded-full ${link.badgeColor || 'bg-amber-500'}`}>
                      {link.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
