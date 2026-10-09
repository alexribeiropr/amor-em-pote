import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, Clock, AlertTriangle, TrendingUp, Calendar, ShoppingBag, ArrowRight, CheckCircle, Package } from 'lucide-react';
import { api } from '../../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    salesToday: 0,
    salesWeek: 0,
    salesMonth: 0,
    pendingOrders: 0,
    totalOrders: 0,
    lowStockCount: 0,
    lowStockProducts: []
  });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [dash, ords] = await Promise.all([
        api.getDashboard(),
        api.getOrders()
      ]);
      setStats(dash);
      setOrders(ords.slice(0, 5));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const formatBRL = (val) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-white/70 rounded-xl w-48"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-white rounded-3xl border border-[#F2E5D9] shadow-cake"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#2C1810]">
            Visão Geral das Vendas 📊
          </h1>
          <p className="text-xs sm:text-sm text-[#7C4A2D]">
            Acompanhe o faturamento, pedidos pendentes e estoque em tempo real
          </p>
        </div>

        <button
          onClick={loadDashboardData}
          className="self-start sm:self-auto text-xs font-black text-[#E85D88] bg-white border border-[#F2E5D9] hover:bg-[#FDF2F4] px-4 py-2.5 rounded-2xl transition-all shadow-xs active:scale-95"
        >
          🔄 Atualizar Dados
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Sales Today */}
        <div className="bg-white rounded-3xl p-6 border border-[#F2E5D9] shadow-cake hover:shadow-cake-hover transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#7C4A2D]">
              Vendas Hoje
            </span>
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-[#2C1810]">
              {formatBRL(stats.salesToday)}
            </span>
            <span className="text-[11px] block text-emerald-700 font-bold mt-1">
              Faturamento do dia
            </span>
          </div>
        </div>

        {/* Sales This Week */}
        <div className="bg-white rounded-3xl p-6 border border-[#F2E5D9] shadow-cake hover:shadow-cake-hover transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#7C4A2D]">
              Últimos 7 Dias
            </span>
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-[#2C1810]">
              {formatBRL(stats.salesWeek)}
            </span>
            <span className="text-[11px] block text-blue-700 font-bold mt-1">
              Total acumulado na semana
            </span>
          </div>
        </div>

        {/* Sales This Month */}
        <div className="bg-white rounded-3xl p-6 border border-[#F2E5D9] shadow-cake hover:shadow-cake-hover transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#7C4A2D]">
              Vendas do Mês
            </span>
            <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-[#2C1810]">
              {formatBRL(stats.salesMonth)}
            </span>
            <span className="text-[11px] block text-purple-700 font-bold mt-1">
              Faturamento total do mês
            </span>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white rounded-3xl p-6 border border-[#F2E5D9] shadow-cake hover:shadow-cake-hover transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#7C4A2D]">
              Pedidos Pendentes
            </span>
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-[#2C1810]">
              {stats.pendingOrders}
            </span>
            <span className="text-[11px] block text-amber-700 font-bold mt-1">
              Novos ou Em preparo
            </span>
          </div>
        </div>
      </div>

      {/* Low Stock Warning Alert Section (< 5 units) */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#F2E5D9] shadow-cake space-y-5">
        <div className="flex items-center justify-between pb-3.5 border-b border-[#F2E5D9]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-base sm:text-lg text-[#2C1810]">
                Alerta de Sabores com Estoque Baixo (&lt; 5 unidades)
              </h2>
              <p className="text-xs text-[#7C4A2D]">
                Sabores que necessitam de nova fornada ou reposição na cozinha
              </p>
            </div>
          </div>

          <Link
            to="/admin/estoque"
            className="text-xs font-black text-[#E85D88] hover:text-[#C73866] flex items-center gap-1 group"
          >
            <span>Gerenciar Estoque</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {stats.lowStockProducts.length === 0 ? (
          <div className="py-8 text-center text-xs text-emerald-800 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span className="font-bold">Todos os sabores estão com estoque acima de 5 unidades!</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.lowStockProducts.map(prod => (
              <div
                key={prod.id}
                className="bg-[#FFFDF9] rounded-2xl p-4 border border-rose-200/80 flex items-center justify-between gap-3 shadow-xs hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-12 h-12 rounded-xl object-cover bg-gray-100 shrink-0 border border-[#F2E5D9]"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                  <div className="min-w-0">
                    <h4 className="font-black text-xs sm:text-sm text-[#2C1810] truncate">
                      {prod.name}
                    </h4>
                    <span className="text-[11px] text-[#7C4A2D] font-medium">
                      {formatBRL(prod.price)}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`text-xs font-black px-2.5 py-1 rounded-full ${
                    prod.stock === 0 ? 'bg-rose-600 text-white' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {prod.stock === 0 ? 'Esgotado' : `${prod.stock} un`}
                  </span>
                  <Link
                    to="/admin/estoque"
                    className="block text-[11px] font-black text-[#E85D88] hover:underline mt-1"
                  >
                    Repor (+)
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Orders Preview */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#F2E5D9] shadow-cake space-y-4">
        <div className="flex items-center justify-between pb-3.5 border-b border-[#F2E5D9]">
          <h2 className="font-black text-base sm:text-lg text-[#2C1810] flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#E85D88]" />
            <span>Últimos Pedidos Recebidos</span>
          </h2>
          <Link
            to="/admin/pedidos"
            className="text-xs font-black text-[#E85D88] hover:text-[#C73866] flex items-center gap-1 group"
          >
            <span>Ver todos ({stats.totalOrders})</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {orders.length === 0 ? (
          <p className="text-xs text-[#7C4A2D] text-center py-6">Nenhum pedido registrado ainda.</p>
        ) : (
          <div className="divide-y divide-[#F2E5D9]/60">
            {orders.map(o => (
              <div key={o.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-[#2C1810]">#{o.id}</span>
                    <span className="text-[#F2E5D9]">•</span>
                    <span className="font-bold text-[#2C1810]">{o.customer?.name}</span>
                    <span className="text-[11px] text-[#7C4A2D]">({o.customer?.neighborhood})</span>
                  </div>
                  <p className="text-[#7C4A2D] mt-1 text-[11px]">
                    {o.items?.map(it => `${it.quantity}x ${it.name}`).join(', ')}
                  </p>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <span className="font-black text-sm text-[#2C1810]">
                    {formatBRL(o.total)}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                    o.status === 'Novo' ? 'bg-amber-100 text-amber-800' :
                    o.status === 'Em preparo' ? 'bg-blue-100 text-blue-800' :
                    o.status === 'Enviado' ? 'bg-purple-100 text-purple-800' :
                    o.status === 'Entregue' ? 'bg-emerald-100 text-emerald-800' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {o.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
