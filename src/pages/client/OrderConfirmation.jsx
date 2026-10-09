import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { CheckCircle2, MessageCircle, Home, Clock, MapPin, Receipt, Sparkles } from 'lucide-react';
import { api } from '../../services/api';

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [whatsappUrl, setWhatsappUrl] = useState(location.state?.whatsappUrl || '');
  const [loading, setLoading] = useState(!order);

  useEffect(() => {
    if (!order && orderId) {
      async function fetchOrder() {
        try {
          const orders = await api.getOrders();
          const found = orders.find(o => o.id === orderId);
          if (found) setOrder(found);
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      }
      fetchOrder();
    }
  }, [orderId, order]);

  const formatBRL = (val) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#F2E5D9] shadow-cake hover:shadow-cake-hover transition-all text-center space-y-7">
        {/* Animated Celebration Icon */}
        <div className="relative inline-block">
          <div className="w-24 h-24 bg-[#FDF2F4] rounded-3xl flex items-center justify-center mx-auto text-5xl shadow-inner transform rotate-1 hover:rotate-6 transition-transform">
            🍰
          </div>
          <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-2 shadow-lg ring-4 ring-white animate-bounce">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-black text-[#E85D88] bg-[#FDF2F4] px-4 py-1 rounded-full uppercase tracking-widest border border-[#E85D88]/30">
            <Sparkles className="w-3.5 h-3.5" />
            Pedido #{order?.id || orderId}
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-[#2C1810]">
            Pedido enviado com sucesso! 🎉
          </h1>
          <p className="text-sm sm:text-base text-[#7C4A2D] max-w-md mx-auto font-medium">
            Seu pedido foi registrado no sistema e o estoque foi reservado. Aguarde nosso contato via WhatsApp para confirmação do preparo!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-7 py-3.5 rounded-2xl font-black text-sm shadow-md shadow-emerald-600/30 transition-all transform hover:scale-[1.02] active:scale-95"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Abrir Conversa no WhatsApp</span>
            </a>
          )}

          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#FFFDF9] hover:bg-[#FDF2F4] text-[#2C1810] border border-[#F2E5D9] px-6 py-3.5 rounded-2xl font-black text-sm transition-all"
          >
            <Home className="w-4 h-4 text-[#E85D88]" />
            <span>Voltar ao Cardápio</span>
          </Link>
        </div>

        {/* Order Details Receipt Card */}
        {order && (
          <div className="bg-[#FFFDF9] rounded-3xl p-6 border border-[#F2E5D9] text-left space-y-4 text-xs sm:text-sm shadow-xs">
            <div className="flex justify-between items-center pb-3 border-b border-[#F2E5D9]">
              <span className="font-black text-[#2C1810] flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#E85D88]" />
                Comprovante do Pedido
              </span>
              <span className="bg-amber-100 text-amber-800 text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                Status: {order.status || 'Novo'}
              </span>
            </div>

            {/* Items */}
            <div className="space-y-2">
              <span className="text-[10px] font-black text-[#A05A36] uppercase tracking-wider">Itens Escolhidos:</span>
              {order.items?.map((it, idx) => (
                <div key={idx} className="flex justify-between text-[#2C1810] py-1 border-b border-[#F2E5D9]/40">
                  <span className="font-medium">
                    <strong className="font-black">{it.quantity}x</strong> {it.name}
                  </span>
                  <span className="font-bold text-[#7C4A2D]">{formatBRL(it.price * it.quantity)}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="pt-2 border-t border-[#F2E5D9] space-y-1.5">
              <div className="flex justify-between text-[#7C4A2D]">
                <span>Taxa de Entrega:</span>
                <span>{formatBRL(order.deliveryFee || 5)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-[#2C1810] pt-1">
                <span>Total:</span>
                <span className="text-xl text-[#E85D88]">{formatBRL(order.total)}</span>
              </div>
            </div>

            {/* Address & Payment */}
            <div className="pt-3 border-t border-[#F2E5D9] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="font-black text-[#A05A36] block mb-1 uppercase tracking-wider text-[10px]">Endereço de Entrega:</span>
                <p className="text-[#2C1810] leading-relaxed">
                  {order.customer?.street}, nº {order.customer?.number}
                  <br />
                  {order.customer?.neighborhood}
                  {order.customer?.complement && ` (${order.customer.complement})`}
                </p>
              </div>

              <div>
                <span className="font-black text-[#A05A36] block mb-1 uppercase tracking-wider text-[10px]">Forma de Pagamento:</span>
                <p className="text-[#2C1810] font-black text-sm">
                  {order.paymentMethod}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="pt-2 text-xs text-[#7C4A2D] flex items-center justify-center gap-2 font-medium">
          <Clock className="w-4 h-4 text-[#E85D88]" />
          <span>Tempo estimado de entrega: 30 a 50 minutos</span>
        </div>
      </div>
    </div>
  );
}
