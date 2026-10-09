import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Send, CheckCircle2, AlertCircle, CreditCard, Banknote, QrCode, ShieldCheck, MapPin, User, MessageCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { api } from '../../services/api';
import confetti from 'canvas-confetti';

export default function Checkout() {
  const { cart, subtotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [settings, setSettings] = useState({
    sellerPhone: '5511999998888',
    deliveryFee: 5.00,
    storeName: 'Amor em Pote - Doces Artesanais'
  });

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    street: '',
    number: '',
    neighborhood: '',
    complement: '',
    reference: '',
    paymentMethod: 'PIX',
    notes: '',
    changeFor: ''
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (cart.length === 0) {
      navigate('/carrinho');
      return;
    }

    async function fetchSettings() {
      try {
        const conf = await api.getSettings();
        if (conf) setSettings(conf);
      } catch (err) {
        console.error(err);
      }
    }
    fetchSettings();
  }, [cart, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const formatBRL = (val) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const deliveryFee = Number(settings.deliveryFee) || 5.00;
  const total = subtotal + deliveryFee;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.name.trim()) {
      setErrorMessage('Por favor, informe seu nome completo.');
      return;
    }
    if (!formData.phone.trim() || formData.phone.length < 9) {
      setErrorMessage('Por favor, informe um WhatsApp válido com DDD.');
      return;
    }
    if (!formData.street.trim() || !formData.number.trim() || !formData.neighborhood.trim()) {
      setErrorMessage('Por favor, preencha rua, número e bairro para a entrega.');
      return;
    }

    try {
      setLoading(true);

      const orderPayload = {
        customer: {
          name: formData.name,
          phone: formData.phone,
          street: formData.street,
          number: formData.number,
          neighborhood: formData.neighborhood,
          complement: formData.complement,
          reference: formData.reference
        },
        items: cart.map(it => ({
          productId: it.productId,
          name: it.name,
          price: it.price,
          quantity: it.quantity
        })),
        paymentMethod: formData.paymentMethod + (formData.paymentMethod === 'Dinheiro' && formData.changeFor ? ` (Troco p/ R$ ${formData.changeFor})` : ''),
        notes: formData.notes,
        deliveryFee: deliveryFee
      };

      const result = await api.createOrder(orderPayload);
      const createdOrder = result.order;

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {}

      const sellerPhoneClean = (settings.sellerPhone || '5511999998888').replace(/\D/g, '');

      let itemsListText = createdOrder.items
        .map(i => `• ${i.quantity}x ${i.name} (${formatBRL(i.price * i.quantity)})`)
        .join('\n');

      let fullAddressText = `${formData.street}, nº ${formData.number} - ${formData.neighborhood}`;
      if (formData.complement) fullAddressText += ` (${formData.complement})`;
      if (formData.reference) fullAddressText += `\n📍 Ref: ${formData.reference}`;

      const whatsappMessage = 
`*NOVO PEDIDO #${createdOrder.id}* 🍰
*${settings.storeName}*
------------------------------
👤 *Cliente:* ${formData.name}
📱 *WhatsApp:* ${formData.phone}

📦 *ITENS DO PEDIDO:*
${itemsListText}

💰 *Subtotal:* ${formatBRL(createdOrder.subtotal)}
🛵 *Taxa de Entrega:* ${formatBRL(createdOrder.deliveryFee)}
💵 *TOTAL:* *${formatBRL(createdOrder.total)}*

💳 *Forma de Pagamento:* ${orderPayload.paymentMethod}
🏠 *Endereço de Entrega:*
${fullAddressText}
${formData.notes ? `\n📝 *Observações:* ${formData.notes}` : ''}
------------------------------
_Pedido gerado via cardápio online Amor em Pote._`;

      const whatsappUrl = `https://wa.me/${sellerPhoneClean}?text=${encodeURIComponent(whatsappMessage)}`;

      clearCart();
      window.open(whatsappUrl, '_blank');
      navigate(`/confirmacao/${createdOrder.id}`, {
        state: { order: createdOrder, whatsappUrl }
      });

    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Erro ao processar o pedido. Verifique a disponibilidade do estoque.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Back button */}
      <div className="mb-6">
        <Link
          to="/carrinho"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#7C4A2D] hover:text-[#E85D88] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Carrinho</span>
        </Link>
      </div>

      <div className="pb-4 border-b border-[#F2E5D9] mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-[#2C1810]">
          Finalizar Pedido 🛵
        </h1>
        <p className="text-xs sm:text-sm text-[#7C4A2D]">
          Preencha seus dados para entrega e atendimento rápido via WhatsApp
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Customer Info */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#F2E5D9] shadow-cake space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-[#F2E5D9]">
            <span className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#E85D88] to-[#FB7185] text-white text-xs flex items-center justify-center font-black shadow-xs">
              1
            </span>
            <h2 className="font-black text-base text-[#2C1810]">
              Seus Dados de Contato
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#7C4A2D] mb-1.5">
                Nome Completo *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Ex: Ana Maria Silva"
                className="w-full px-4 py-3 rounded-2xl border border-[#F2E5D9] text-sm focus:outline-none focus:ring-2 focus:ring-[#E85D88]/40 focus:border-[#E85D88] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#7C4A2D] mb-1.5">
                WhatsApp com DDD *
              </label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="Ex: 11987654321"
                className="w-full px-4 py-3 rounded-2xl border border-[#F2E5D9] text-sm focus:outline-none focus:ring-2 focus:ring-[#E85D88]/40 focus:border-[#E85D88] transition-all"
              />
            </div>
          </div>
        </div>

        {/* Step 2: Delivery Address */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#F2E5D9] shadow-cake space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-[#F2E5D9]">
            <span className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#E85D88] to-[#FB7185] text-white text-xs flex items-center justify-center font-black shadow-xs">
              2
            </span>
            <h2 className="font-black text-base text-[#2C1810]">
              Endereço de Entrega
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#7C4A2D] mb-1.5">
                Rua / Avenida *
              </label>
              <input
                type="text"
                name="street"
                required
                value={formData.street}
                onChange={handleChange}
                placeholder="Ex: Rua das Rosas"
                className="w-full px-4 py-3 rounded-2xl border border-[#F2E5D9] text-sm focus:outline-none focus:ring-2 focus:ring-[#E85D88]/40 focus:border-[#E85D88] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#7C4A2D] mb-1.5">
                Número *
              </label>
              <input
                type="text"
                name="number"
                required
                value={formData.number}
                onChange={handleChange}
                placeholder="Ex: 120"
                className="w-full px-4 py-3 rounded-2xl border border-[#F2E5D9] text-sm focus:outline-none focus:ring-2 focus:ring-[#E85D88]/40 focus:border-[#E85D88] transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#7C4A2D] mb-1.5">
                Bairro *
              </label>
              <input
                type="text"
                name="neighborhood"
                required
                value={formData.neighborhood}
                onChange={handleChange}
                placeholder="Ex: Centro"
                className="w-full px-4 py-3 rounded-2xl border border-[#F2E5D9] text-sm focus:outline-none focus:ring-2 focus:ring-[#E85D88]/40 focus:border-[#E85D88] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#7C4A2D] mb-1.5">
                Complemento (opcional)
              </label>
              <input
                type="text"
                name="complement"
                value={formData.complement}
                onChange={handleChange}
                placeholder="Ex: Apto 102, Bloco B"
                className="w-full px-4 py-3 rounded-2xl border border-[#F2E5D9] text-sm focus:outline-none focus:ring-2 focus:ring-[#E85D88]/40 focus:border-[#E85D88] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#7C4A2D] mb-1.5">
              Ponto de Referência (opcional)
            </label>
            <input
              type="text"
              name="reference"
              value={formData.reference}
              onChange={handleChange}
              placeholder="Ex: Próximo à farmácia São João, portão de madeira"
              className="w-full px-4 py-3 rounded-2xl border border-[#F2E5D9] text-sm focus:outline-none focus:ring-2 focus:ring-[#E85D88]/40 focus:border-[#E85D88] transition-all"
            />
          </div>
        </div>

        {/* Step 3: Payment & Notes */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#F2E5D9] shadow-cake space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-[#F2E5D9]">
            <span className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#E85D88] to-[#FB7185] text-white text-xs flex items-center justify-center font-black shadow-xs">
              3
            </span>
            <h2 className="font-black text-base text-[#2C1810]">
              Forma de Pagamento & Observações
            </h2>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#7C4A2D] mb-2.5">
              Escolha a forma de pagamento:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'PIX', label: 'PIX', icon: QrCode, desc: 'Chave ou QR Code' },
                { id: 'Cartão', label: 'Cartão', icon: CreditCard, desc: 'Na maquininha' },
                { id: 'Dinheiro', label: 'Dinheiro', icon: Banknote, desc: 'Pague ao entregador' }
              ].map(opt => {
                const Icon = opt.icon;
                const selected = formData.paymentMethod === opt.id;
                return (
                  <label
                    key={opt.id}
                    className={`cursor-pointer rounded-2xl p-4 border transition-all flex flex-col items-center text-center select-none ${
                      selected
                        ? 'border-[#E85D88] bg-[#FDF2F4] ring-2 ring-[#E85D88]/40 shadow-xs'
                        : 'border-[#F2E5D9] hover:bg-[#FFFDF9]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={opt.id}
                      checked={selected}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <Icon className={`w-6 h-6 mb-1.5 ${selected ? 'text-[#E85D88]' : 'text-[#7C4A2D]'}`} />
                    <span className="font-black text-sm text-[#2C1810]">{opt.label}</span>
                    <span className="text-[11px] text-[#7C4A2D] font-medium">{opt.desc}</span>
                  </label>
                );
              })}
            </div>

            {formData.paymentMethod === 'Dinheiro' && (
              <div className="mt-3.5 p-3.5 bg-[#FFFDF9] rounded-2xl border border-[#F2E5D9]">
                <label className="block text-xs font-bold text-[#7C4A2D] mb-1">
                  Precisa de troco para quanto? (Deixe em branco se tiver o valor exato)
                </label>
                <input
                  type="text"
                  name="changeFor"
                  value={formData.changeFor}
                  onChange={handleChange}
                  placeholder="Ex: 50,00"
                  className="w-full sm:w-48 px-3.5 py-2 rounded-xl border border-[#F2E5D9] text-xs focus:outline-none focus:ring-1 focus:ring-[#E85D88]"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-[#7C4A2D] mb-1.5">
              Observações adicionais (opcional)
            </label>
            <textarea
              name="notes"
              rows="2"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Ex: Sem granulado no pote de morango, caprichar na colher..."
              className="w-full px-4 py-2.5 rounded-2xl border border-[#F2E5D9] text-sm focus:outline-none focus:ring-2 focus:ring-[#E85D88]/40 focus:border-[#E85D88] transition-all"
            ></textarea>
          </div>
        </div>

        {/* Order Items Review & Final Submit */}
        <div className="bg-[#FFFDF9] rounded-3xl p-6 sm:p-7 border-2 border-[#E85D88]/40 shadow-cake space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-[#F2E5D9]">
            <span className="font-black text-sm text-[#2C1810]">Resumo dos Itens ({cart.length})</span>
            <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Estoque garantido
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {cart.map(i => (
              <div key={i.productId} className="flex justify-between text-[#7C4A2D]">
                <span>{i.quantity}x {i.name}</span>
                <span className="font-bold text-[#2C1810]">{formatBRL(i.price * i.quantity)}</span>
              </div>
            ))}
            <div className="flex justify-between text-[#7C4A2D] pt-2 border-t border-[#F2E5D9]">
              <span>Taxa de Entrega</span>
              <span className="font-bold text-[#2C1810]">{formatBRL(deliveryFee)}</span>
            </div>
            <div className="flex justify-between text-base font-black text-[#2C1810] pt-2 border-t border-[#F2E5D9]">
              <span>TOTAL A PAGAR</span>
              <span className="text-2xl text-[#E85D88]">{formatBRL(total)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#E85D88] hover:bg-[#C73866] text-white py-4 px-6 rounded-2xl font-black text-base shadow-md shadow-[#E85D88]/30 transition-all transform hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? (
              <span>Processando pedido... 🍰</span>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Enviar Pedido para o WhatsApp</span>
              </>
            )}
          </button>

          <p className="text-[11px] text-center text-[#7C4A2D] font-medium">
            Ao clicar, seu pedido será registrado no sistema e você será direcionado ao WhatsApp da confeitaria com a mensagem pronta!
          </p>
        </div>
      </form>
    </div>
  );
}
