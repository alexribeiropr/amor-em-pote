import React, { useState, useEffect } from 'react';
import { MessageCircle, CheckCircle, Clock, Truck, CheckCheck, XCircle, MapPin, Receipt, Phone, AlertCircle, Sparkles, Filter } from 'lucide-react';
import { api } from '../../services/api';

const STATUS_FILTERS = ['Todos', 'Novo', 'Em preparo', 'Enviado', 'Entregue', 'Cancelado'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [settings, setSettings] = useState({
    storeName: 'Amor em Pote - Doces Artesanais',
    estimatedDeliveryTime: '30 a 50 minutos'
  });
  const [selectedFilter, setSelectedFilter] = useState('Todos');
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    try {
      const [ordList, conf] = await Promise.all([
        api.getOrders(),
        api.getSettings()
      ]);
      setOrders(ordList);
      if (conf) setSettings(conf);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3000);
  };

  const formatBRL = (val) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      await loadOrders();

      if (newStatus === 'Cancelado') {
        showToast(`Pedido #${orderId} cancelado e estoque DEVOLVIDO com sucesso! 🔄`, 'info');
      } else {
        showToast(`Pedido #${orderId} atualizado para "${newStatus}"! ✅`);
      }
    } catch (err) {
      showToast(err.message || 'Erro ao atualizar status', 'error');
    }
  };

  // Generate WhatsApp message for customer
  const handleOpenWhatsAppCustomer = (order) => {
    const phoneClean = (order.customer.phone || '').replace(/\D/g, '');
    const clientPhone = phoneClean.startsWith('55') ? phoneClean : `55${phoneClean}`;

    let itemsText = order.items
      .map(i => `• ${i.quantity}x ${i.name} (${formatBRL(i.price * i.quantity)})`)
      .join('\n');

    let addressText = `${order.customer.street}, nº ${order.customer.number} - ${order.customer.neighborhood}`;
    if (order.customer.complement) addressText += ` (${order.customer.complement})`;
    if (order.customer.reference) addressText += `\n📍 Ref: ${order.customer.reference}`;

    const text = 
`Olá, *${order.customer.name}*! Tudo bem? 🍰
Aqui é da confeitaria *${settings.storeName}*!

Confirmamos o seu pedido *#${order.id}* com muito carinho:

📦 *Itens:*
${itemsText}

💰 *Valor Total:* *${formatBRL(order.total)}*
💳 *Forma de Pagamento:* ${order.paymentMethod}
🏠 *Endereço de Entrega:* ${addressText}
⏱️ *Tempo Estimado:* ${settings.estimatedDeliveryTime || '30 a 50 minutos'}
📌 *Status Atual:* ${order.status}

Já estamos cuidando de tudo para que seu bolo de pote chegue fresquinho e delicioso! Qualquer dúvida, pode nos chamar aqui. Obrigado pela preferência! ❤️`;

    const url = `https://wa.me/${clientPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const filteredOrders = orders.filter(o => {
    if (selectedFilter === 'Todos') return true;
    return o.status === selectedFilter;
  });

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div className={`p-4 rounded-2xl border text-xs sm:text-sm font-black flex items-center gap-2 shadow-lg transition-all ${
          feedback.type === 'error'
            ? 'bg-rose-50 border-rose-200 text-rose-800'
            : feedback.type === 'info'
            ? 'bg-blue-50 border-blue-200 text-blue-800'
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Header & Status Filter Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#2C1810]">
            Gestão de Pedidos 📋
          </h1>
          <p className="text-xs sm:text-sm text-[#7C4A2D]">
            Acompanhe a produção, atualize status e envie mensagens pré-formatadas aos clientes
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-[#7C4A2D] bg-white border border-[#F2E5D9] px-4 py-2 rounded-2xl shadow-xs">
            Total de Pedidos: {orders.length}
          </span>
        </div>
      </div>

      {/* Status Filter Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {STATUS_FILTERS.map(filter => {
          const count = filter === 'Todos'
            ? orders.length
            : orders.filter(o => o.status === filter).length;

          return (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black shrink-0 transition-all flex items-center gap-2 ${
                selectedFilter === filter
                  ? 'bg-[#2C1810] text-white shadow-sm scale-102'
                  : 'bg-white text-[#7C4A2D] hover:bg-[#FDF2F4] border border-[#F2E5D9]'
              }`}
            >
              <span>{filter}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                selectedFilter === filter ? 'bg-[#E85D88] text-white' : 'bg-gray-100 text-gray-700'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#F2E5D9] shadow-cake max-w-md mx-auto space-y-3">
          <span className="text-5xl block">📦</span>
          <h3 className="font-black text-base text-[#2C1810]">
            Nenhum pedido nesta categoria
          </h3>
          <p className="text-xs text-[#7C4A2D]">
            Quando novos pedidos chegarem ou forem alterados, aparecerão aqui em tempo real.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {filteredOrders.map(order => {
            const isCancelled = order.status === 'Cancelado';
            const isDelivered = order.status === 'Entregue';

            return (
              <div
                key={order.id}
                className={`bg-white rounded-3xl p-6 sm:p-7 border transition-all shadow-cake flex flex-col justify-between space-y-5 hover:shadow-cake-hover ${
                  order.status === 'Novo'
                    ? 'border-amber-400 ring-2 ring-amber-400/20 shadow-md'
                    : isCancelled
                    ? 'border-gray-200 opacity-75 bg-gray-50/50'
                    : 'border-[#F2E5D9]'
                }`}
              >
                {/* Order Header */}
                <div>
                  <div className="flex items-start justify-between gap-3 pb-3.5 border-b border-[#F2E5D9]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-base sm:text-lg text-[#2C1810]">
                          #{order.id}
                        </span>
                        <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                          order.status === 'Novo' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                          order.status === 'Em preparo' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'Enviado' ? 'bg-purple-100 text-purple-800' :
                          order.status === 'Entregue' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#7C4A2D] font-medium block mt-0.5">
                        {new Date(order.createdAt).toLocaleString('pt-BR')}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-black text-[#E85D88]">
                        {formatBRL(order.total)}
                      </span>
                      <span className="text-[10px] block font-bold text-[#7C4A2D]">
                        {order.paymentMethod}
                      </span>
                    </div>
                  </div>

                  {/* Customer & Address Details */}
                  <div className="mt-4 p-4 bg-[#FFFDF9] rounded-2xl border border-[#F2E5D9] space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-[#2C1810]">
                        👤 {order.customer?.name}
                      </span>
                      <span className="text-[#7C4A2D] font-bold">
                        📱 {order.customer?.phone}
                      </span>
                    </div>

                    <div className="flex items-start gap-2 text-[#7C4A2D]">
                      <MapPin className="w-4 h-4 text-[#E85D88] shrink-0 mt-0.5" />
                      <div>
                        <span>
                          {order.customer?.street}, nº {order.customer?.number} - {order.customer?.neighborhood}
                          {order.customer?.complement && ` (${order.customer.complement})`}
                        </span>
                        {order.customer?.reference && (
                          <span className="block text-[11px] text-[#2C1810] font-bold mt-0.5">
                            📍 Ref: {order.customer.reference}
                          </span>
                        )}
                      </div>
                    </div>

                    {order.notes && (
                      <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] font-bold">
                        📝 <strong>Obs do cliente:</strong> {order.notes}
                      </div>
                    )}
                  </div>

                  {/* Items Ordered */}
                  <div className="mt-4 space-y-1.5 text-xs">
                    <span className="text-[10px] font-black text-[#A05A36] uppercase tracking-wider block">
                      Itens do Pedido ({order.items?.length}):
                    </span>
                    {order.items?.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-[#2C1810] py-1.5 border-b border-[#F2E5D9]/50">
                        <span className="font-medium">
                          <strong className="font-black text-[#2C1810]">{it.quantity}x</strong> {it.name}
                        </span>
                        <span className="font-bold text-[#7C4A2D]">
                          {formatBRL(it.price * it.quantity)}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between text-[11px] text-[#7C4A2D] pt-1">
                      <span>Taxa de Entrega:</span>
                      <span>{formatBRL(order.deliveryFee || 0)}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-3.5 border-t border-[#F2E5D9] space-y-2.5">
                  {/* WhatsApp button */}
                  <button
                    onClick={() => handleOpenWhatsAppCustomer(order)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/20 transition-all active:scale-95 hover:scale-[1.01]"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Falar no WhatsApp (Mensagem Pronta)</span>
                  </button>

                  {/* Status Progression Workflow */}
                  {!isCancelled && !isDelivered && (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {order.status === 'Novo' && (
                        <button
                          onClick={() => handleStatusChange(order.id, 'Em preparo')}
                          className="bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-1.5 active:scale-95"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Iniciar Preparo</span>
                        </button>
                      )}

                      {order.status === 'Em preparo' && (
                        <button
                          onClick={() => handleStatusChange(order.id, 'Enviado')}
                          className="bg-purple-600 hover:bg-purple-700 text-white py-2.5 px-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-1.5 active:scale-95"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Marcar como Enviado 🛵</span>
                        </button>
                      )}

                      {(order.status === 'Enviado' || order.status === 'Em preparo') && (
                        <button
                          onClick={() => handleStatusChange(order.id, 'Entregue')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-1.5 active:scale-95"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>Concluir Entrega</span>
                        </button>
                      )}

                      {/* Cancel Order with Stock Return */}
                      <button
                        onClick={() => {
                          if (window.confirm(`Tem certeza que deseja cancelar o pedido #${order.id}? As quantidades serão DEVOLVIDAS ao estoque automaticamente.`)) {
                            handleStatusChange(order.id, 'Cancelado');
                          }
                        }}
                        className="bg-gray-100 hover:bg-rose-50 text-rose-700 hover:border-rose-200 border border-gray-200 py-2.5 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancelar (Devolve Estoque)</span>
                      </button>
                    </div>
                  )}

                  {isDelivered && (
                    <div className="text-center py-2 text-xs font-black text-emerald-800 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-center gap-2">
                      <CheckCheck className="w-4 h-4 text-emerald-600" />
                      <span>Pedido concluído e entregue com sucesso!</span>
                    </div>
                  )}

                  {isCancelled && (
                    <div className="text-center py-2 text-xs font-black text-rose-800 bg-rose-50 rounded-2xl border border-rose-200 flex items-center justify-center gap-2">
                      <XCircle className="w-4 h-4 text-rose-600" />
                      <span>Pedido cancelado • Estoque devolvido</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
