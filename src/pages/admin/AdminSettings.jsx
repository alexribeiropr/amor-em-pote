import React, { useState, useEffect } from 'react';
import { Save, KeyRound, Phone, Store, DollarSign, Clock, Check, AlertCircle, RefreshCw, Tag, Plus, X, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { api } from '../../services/api';

export default function AdminSettings() {
  const [formData, setFormData] = useState({
    storeName: '',
    sellerPhone: '',
    adminPassword: '',
    pixKey: '',
    deliveryFee: '5.00',
    estimatedDeliveryTime: '30 a 50 minutos',
    isOpen: true,
    businessHours: 'Terça a Domingo: 13:00 às 21:00',
    closedMessage: 'Segunda-feira: Fechado para produção artesanal',
    categories: ['Tradicionais', 'Especiais', 'Premium', 'Frutas']
  });

  const [newCatInput, setNewCatInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const conf = await api.getSettings();
      if (conf) {
        setFormData({
          storeName: conf.storeName || 'Amor em Pote - Doces Artesanais',
          sellerPhone: conf.sellerPhone || '5511999998888',
          adminPassword: conf.adminPassword || 'admin123',
          pixKey: conf.pixKey || 'contato@amorpote.com.br',
          deliveryFee: (conf.deliveryFee !== undefined ? conf.deliveryFee : 5.00).toString(),
          estimatedDeliveryTime: conf.estimatedDeliveryTime || '30 a 50 minutos',
          isOpen: conf.isOpen !== undefined ? Boolean(conf.isOpen) : true,
          businessHours: conf.businessHours || 'Terça a Domingo: 13:00 às 21:00',
          closedMessage: conf.closedMessage || 'Segunda-feira: Fechado para produção artesanal',
          categories: Array.isArray(conf.categories) && conf.categories.length > 0
            ? conf.categories
            : ['Tradicionais', 'Especiais', 'Premium', 'Frutas']
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    const trimmed = newCatInput.trim();
    if (!trimmed) return;
    if (formData.categories.includes(trimmed)) {
      setErrorMessage('Esta categoria já existe!');
      return;
    }
    setFormData(prev => ({
      ...prev,
      categories: [...prev.categories, trimmed]
    }));
    setNewCatInput('');
    setErrorMessage('');
  };

  const handleRemoveCategory = (catToRemove) => {
    if (formData.categories.length <= 1) {
      setErrorMessage('Mantenha pelo menos uma categoria.');
      return;
    }
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c !== catToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaved(false);
    setErrorMessage('');

    try {
      await api.updateSettings({
        ...formData,
        deliveryFee: parseFloat(formData.deliveryFee) || 0
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } catch (err) {
      setErrorMessage(err.message || 'Erro ao salvar configurações');
    }
  };

  const handleCleanDemoData = async () => {
    if (window.confirm('Deseja apagar todos os pedidos de teste e o histórico fictício? Seus produtos reais e configurações serão mantidos intactos.')) {
      try {
        await api.clearDemoData();
        alert('Histórico de pedidos fictícios apagado com sucesso! A loja agora está pronta para suas vendas reais.');
        window.location.reload();
      } catch (err) {
        alert('Erro ao limpar dados: ' + (err.message || 'Falha ao processar'));
      }
    }
  };

  const handleResetDemo = () => {
    if (window.confirm('Deseja restaurar os dados de demonstração iniciais (sabores, pedidos e histórico de exemplo)?')) {
      api.resetData();
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#3D2314]">
          Configurações da Loja ⚙️
        </h1>
        <p className="text-xs sm:text-sm text-[#8C5338]">
          Personalize horários de funcionamento, categorias dos bolos, WhatsApp, entrega e dados de acesso
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs">
          <Check className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Configurações salvas com sucesso! As alterações já estão visíveis na loja.</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SEÇÃO 1: HORÁRIO DE FUNCIONAMENTO & STATUS DA LOJA */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#F5E6DC] shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#F5E6DC]">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#E86A8D]" />
              <h2 className="font-extrabold text-base text-[#3D2314]">
                Horário de Atendimento & Status da Loja
              </h2>
            </div>

            {/* Toggle Loja Aberta/Fechada */}
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, isOpen: !prev.isOpen }))}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black transition-all ${
                formData.isOpen
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-rose-100 text-rose-800 border border-rose-300'
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${formData.isOpen ? 'bg-emerald-600 animate-pulse' : 'bg-rose-600'}`} />
              <span>{formData.isOpen ? 'Loja Aberta para Pedidos' : 'Loja Fechada Temporariamente'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#8C5338] mb-1.5">
                Horário de Funcionamento (exibido no site e rodapé)
              </label>
              <input
                type="text"
                name="businessHours"
                required
                value={formData.businessHours}
                onChange={handleChange}
                placeholder="Ex: Terça a Domingo: 13:00 às 21:00"
                className="w-full px-4 py-2.5 rounded-xl border border-[#F5E6DC] text-sm focus:outline-none focus:ring-2 focus:ring-[#E86A8D]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#8C5338] mb-1.5">
                Mensagem de Folga / Fechamento
              </label>
              <input
                type="text"
                name="closedMessage"
                value={formData.closedMessage}
                onChange={handleChange}
                placeholder="Ex: Segunda-feira: Fechado para produção"
                className="w-full px-4 py-2.5 rounded-xl border border-[#F5E6DC] text-sm focus:outline-none focus:ring-2 focus:ring-[#E86A8D]"
              />
            </div>
          </div>
        </div>

        {/* SEÇÃO 2: CATEGORIAS PERSONALIZADAS DE BOLOS */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#F5E6DC] shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-[#F5E6DC]">
            <Tag className="w-5 h-5 text-[#E86A8D]" />
            <div>
              <h2 className="font-extrabold text-base text-[#3D2314]">
                Categorias dos Bolos de Pote
              </h2>
              <p className="text-xs text-[#8C5338]">
                Crie ou remova categorias que aparecem no cardápio do cliente e no cadastro de produtos
              </p>
            </div>
          </div>

          {/* Current Categories Tags */}
          <div>
            <label className="block text-xs font-bold text-[#8C5338] mb-2">
              Categorias Ativas ({formData.categories.length})
            </label>
            <div className="flex flex-wrap gap-2">
              {formData.categories.map((cat, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 bg-[#FBE8EE] text-[#E86A8D] font-bold text-xs px-3 py-1.5 rounded-xl border border-[#E86A8D]/30 shadow-xs"
                >
                  <span>{cat}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCategory(cat)}
                    className="hover:bg-[#E86A8D] hover:text-white rounded-full p-0.5 transition-colors"
                    title={`Remover categoria ${cat}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Add New Category Input */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              value={newCatInput}
              onChange={(e) => setNewCatInput(e.target.value)}
              placeholder="Digite o nome da nova categoria (ex: Fit / Zero Açúcar, Edição Limitada)..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-[#F5E6DC] text-sm focus:outline-none focus:ring-2 focus:ring-[#E86A8D]"
            />
            <button
              type="button"
              onClick={handleAddCategory}
              className="inline-flex items-center justify-center gap-1.5 bg-[#3D2314] hover:bg-[#5C3826] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Categoria</span>
            </button>
          </div>
        </div>

        {/* SEÇÃO 3: DADOS DA LOJA & CONTATO */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#F5E6DC] shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-[#F5E6DC]">
            <Store className="w-5 h-5 text-[#E86A8D]" />
            <h2 className="font-extrabold text-base text-[#3D2314]">
              Dados da Loja, Contato & Pagamento
            </h2>
          </div>

          {/* Store Name */}
          <div>
            <label className="block text-xs font-bold text-[#8C5338] mb-1.5">
              Nome da Confeitaria / Marca
            </label>
            <input
              type="text"
              name="storeName"
              required
              value={formData.storeName}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-[#F5E6DC] text-sm focus:outline-none focus:ring-2 focus:ring-[#E86A8D]"
            />
          </div>

          {/* WhatsApp & Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#8C5338] mb-1.5 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp do Vendedor (com DDD e DDI)</span>
              </label>
              <input
                type="text"
                name="sellerPhone"
                required
                value={formData.sellerPhone}
                onChange={handleChange}
                placeholder="Ex: 5511999998888"
                className="w-full px-4 py-2.5 rounded-xl border border-[#F5E6DC] text-sm focus:outline-none focus:ring-2 focus:ring-[#E86A8D]"
              />
              <span className="text-[11px] text-[#8C5338] mt-1 block">
                Número que receberá as mensagens diretas de pedidos dos clientes (wa.me)
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#8C5338] mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-[#E86A8D]" />
                <span>Senha de Acesso do Administrador</span>
              </label>
              <input
                type="text"
                name="adminPassword"
                required
                value={formData.adminPassword}
                onChange={handleChange}
                placeholder="Ex: admin123"
                className="w-full px-4 py-2.5 rounded-xl border border-[#F5E6DC] text-sm focus:outline-none focus:ring-2 focus:ring-[#E86A8D]"
              />
              <span className="text-[11px] text-[#8C5338] mt-1 block">
                Altere para qualquer senha simples que você preferir
              </span>
            </div>
          </div>

          {/* PIX Key, Delivery Fee & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#8C5338] mb-1.5">
                Chave PIX
              </label>
              <input
                type="text"
                name="pixKey"
                value={formData.pixKey}
                onChange={handleChange}
                placeholder="CPF, CNPJ, E-mail ou Celular"
                className="w-full px-4 py-2.5 rounded-xl border border-[#F5E6DC] text-sm focus:outline-none focus:ring-2 focus:ring-[#E86A8D]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#8C5338] mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>Taxa de Entrega Padrão (R$)</span>
              </label>
              <input
                type="number"
                step="0.50"
                name="deliveryFee"
                value={formData.deliveryFee}
                onChange={handleChange}
                placeholder="5.00"
                className="w-full px-4 py-2.5 rounded-xl border border-[#F5E6DC] text-sm focus:outline-none focus:ring-2 focus:ring-[#E86A8D]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#8C5338] mb-1.5 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#E86A8D]" />
                <span>Tempo Estimado de Entrega</span>
              </label>
              <input
                type="text"
                name="estimatedDeliveryTime"
                value={formData.estimatedDeliveryTime}
                onChange={handleChange}
                placeholder="Ex: 30 a 50 minutos"
                className="w-full px-4 py-2.5 rounded-xl border border-[#F5E6DC] text-sm focus:outline-none focus:ring-2 focus:ring-[#E86A8D]"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#F5E6DC] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={handleCleanDemoData}
                className="text-xs font-black text-rose-600 hover:text-rose-800 flex items-center gap-1.5 bg-rose-50 border border-rose-200 px-3 py-2 rounded-xl transition-colors"
                title="Apagar pedidos de exemplo e zerar histórico para começar a usar de verdade"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Apagar Pedidos Fictícios (Zerar Loja)</span>
              </button>

              <button
                type="button"
                onClick={handleResetDemo}
                className="text-xs font-bold text-gray-500 hover:text-[#3D2314] flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Restaurar dados de demonstração</span>
              </button>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto bg-[#E86A8D] hover:bg-[#C73866] text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-md shadow-[#E86A8D]/25 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Todas as Configurações</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
