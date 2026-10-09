import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, ShieldCheck, Truck, AlertTriangle, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { api } from '../../services/api';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, totalItems, subtotal } = useCart();
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState({ deliveryFee: 5.00 });
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const [prodList, conf] = await Promise.all([
          api.getProducts(),
          api.getSettings()
        ]);
        setProducts(prodList);
        if (conf) setSettings(conf);
      } catch (e) {
        console.error(e);
      }
    }
    loadData();
  }, []);

  const formatBRL = (val) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handleQtyChange = (productId, newQty) => {
    setErrorMsg('');
    const liveProduct = products.find(p => p.id === productId);
    const availableStock = liveProduct ? liveProduct.stock : 99;

    const res = updateQuantity(productId, newQty, availableStock);
    if (!res.success) {
      setErrorMsg(res.message);
    }
  };

  const deliveryFee = Number(settings.deliveryFee) || 5.00;
  const total = subtotal + deliveryFee;

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="bg-white rounded-3xl p-10 sm:p-12 border border-[#F2E5D9] shadow-cake space-y-5">
          <div className="w-24 h-24 bg-[#FDF2F4] rounded-3xl flex items-center justify-center mx-auto text-5xl shadow-inner">
            🫙
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-[#2C1810]">Seu carrinho está vazio!</h2>
            <p className="text-sm text-[#7C4A2D] max-w-sm mx-auto">
              Que tal escolher um delicioso bolo de pote artesanal para alegrar seu dia?
            </p>
          </div>
          <div className="pt-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-[#E85D88] hover:bg-[#C73866] text-white px-8 py-3.5 rounded-2xl font-black text-sm shadow-md shadow-[#E85D88]/25 transition-all transform hover:scale-[1.02] active:scale-95"
            >
              <span>Explorar Cardápio</span>
              <span>🍰</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Back button */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#7C4A2D] hover:text-[#E85D88] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Continuar escolhendo doces</span>
        </Link>
      </div>

      <div className="flex items-center justify-between pb-4 border-b border-[#F2E5D9] mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#2C1810]">
            Meu Carrinho 🍰
          </h1>
          <p className="text-xs sm:text-sm text-[#7C4A2D]">
            Confira seus potes de felicidade antes de finalizar o pedido
          </p>
        </div>
        <span className="bg-[#FDF2F4] text-[#E85D88] font-black text-xs px-3.5 py-1.5 rounded-full border border-[#E85D88]/30">
          {totalItems} {totalItems === 1 ? 'item' : 'itens'}
        </span>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map(item => {
            const liveProd = products.find(p => p.id === item.productId);
            const liveStock = liveProd ? liveProd.stock : item.stock;

            return (
              <div
                key={item.productId}
                className="bg-white rounded-3xl p-4 sm:p-5 border border-[#F2E5D9] shadow-cake flex items-center gap-4 transition-all hover:shadow-cake-hover"
              >
                {/* Photo */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover bg-[#F9EFE7] shrink-0 border border-[#F2E5D9]"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80';
                  }}
                />

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-sm sm:text-base text-[#2C1810] truncate">
                    {item.name}
                  </h3>
                  <div className="text-xs text-[#7C4A2D] mt-0.5">
                    Unitário: <span className="font-bold">{formatBRL(item.price)}</span>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#F2E5D9]/60">
                    {/* Stepper controls */}
                    <div className="flex items-center gap-2 bg-[#FFFDF9] border border-[#F2E5D9] rounded-2xl p-1 shadow-xs">
                      <button
                        onClick={() => handleQtyChange(item.productId, item.quantity - 1)}
                        className="w-7 h-7 rounded-xl bg-white text-[#7C4A2D] hover:bg-[#FDF2F4] hover:text-[#E85D88] flex items-center justify-center transition-colors shadow-xs"
                        aria-label="Diminuir"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>

                      <span className="w-7 text-center text-xs font-black text-[#2C1810]">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => handleQtyChange(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= liveStock}
                        className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors shadow-xs ${
                          item.quantity >= liveStock
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-[#7C4A2D] hover:bg-[#FDF2F4] hover:text-[#E85D88]'
                        }`}
                        aria-label="Aumentar"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Subtotal of this item & remove button */}
                    <div className="text-right">
                      <div className="text-sm font-black text-[#2C1810]">
                        {formatBRL(item.price * item.quantity)}
                      </div>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-[11px] font-bold text-rose-500 hover:text-rose-700 inline-flex items-center gap-1 mt-0.5 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remover</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary Box */}
        <div className="lg:col-span-1 sticky top-24">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#F2E5D9] shadow-cake space-y-5">
            <h2 className="font-black text-lg text-[#2C1810] pb-3 border-b border-[#F2E5D9]">
              Resumo do Pedido
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-[#7C4A2D]">
                <span>Subtotal ({totalItems} itens)</span>
                <span className="font-bold text-[#2C1810]">{formatBRL(subtotal)}</span>
              </div>

              <div className="flex justify-between text-[#7C4A2D]">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-[#E85D88]" />
                  <span>Taxa de Entrega</span>
                </span>
                <span className="font-bold text-[#2C1810]">{formatBRL(deliveryFee)}</span>
              </div>

              <div className="pt-3 border-t border-[#F2E5D9] flex justify-between items-baseline">
                <div>
                  <span className="text-[11px] uppercase font-bold text-[#7C4A2D] block">Total Geral</span>
                  <span className="text-2xl font-black text-[#E85D88]">{formatBRL(total)}</span>
                </div>
                <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Pronto p/ envio
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-[#E85D88] hover:bg-[#C73866] text-white py-4 px-4 rounded-2xl font-black text-sm shadow-md shadow-[#E85D88]/30 transition-all transform hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Avançar para o Checkout</span>
            </button>

            <div className="space-y-2 pt-3 border-t border-[#F2E5D9]/60 text-[11px] text-[#7C4A2D]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Estoque debitado e reservado automaticamente</span>
              </div>
              <div className="flex items-center gap-2">
                <span>💬</span>
                <span>O pedido será despachado direto pelo WhatsApp</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
