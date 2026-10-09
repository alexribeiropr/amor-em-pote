import React, { useState, useEffect, useRef } from 'react';
import { Plus, Minus, Edit2, Trash2, PackagePlus, History, AlertTriangle, Check, X, Camera, Upload, Link as LinkIcon, ArrowDownCircle, ArrowUpCircle, Tag } from 'lucide-react';
import { api } from '../../services/api';

const PRESET_IMAGES = [
  { name: 'Chocolate & Ninho', url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80' },
  { name: 'Cenoura & Brigadeiro', url: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?auto=format&fit=crop&w=600&q=80' },
  { name: 'Morango Cremoso', url: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=600&q=80' },
  { name: 'Red Velvet', url: 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?auto=format&fit=crop&w=600&q=80' },
  { name: 'Maracujá & Ganache', url: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=600&q=80' },
  { name: 'Prestígio & Coco', url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80' }
];

// Utility: compress and resize image from camera or file picker into Base64
function compressImage(file, maxWidth = 600, maxHeight = 600, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

export default function AdminStock() {
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'history'
  const [products, setProducts] = useState([]);
  const [history, setHistory] = useState([]);
  const [categories, setCategories] = useState(['Tradicionais', 'Especiais', 'Premium', 'Frutas']);
  const [loading, setLoading] = useState(true);

  // Hidden file inputs for Camera & Upload
  const cameraInputRef = useRef(null);
  const fileInputRef = useRef(null);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);

  // Quick inline new category inside modal
  const [isAddingNewCat, setIsAddingNewCat] = useState(false);
  const [inlineNewCat, setInlineNewCat] = useState('');

  // Add/Edit Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    image: '',
    category: 'Tradicionais'
  });

  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [prods, hist, conf] = await Promise.all([
        api.getProducts(),
        api.getStockHistory(),
        api.getSettings()
      ]);
      setProducts(prods);
      setHistory(hist);
      if (conf && Array.isArray(conf.categories) && conf.categories.length > 0) {
        setCategories(conf.categories);
      }
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

  const handleStockDelta = async (productId, delta, reason) => {
    try {
      const updated = await api.adjustStock(productId, delta, reason);
      setProducts(prev => prev.map(p => p.id === productId ? updated : p));
      const hist = await api.getStockHistory();
      setHistory(hist);
      showToast(`Estoque de "${updated.name}" atualizado para ${updated.stock} un!`);
    } catch (err) {
      showToast(err.message || 'Erro ao ajustar estoque', 'error');
    }
  };

  // Open Add Modal
  const openAddModal = () => {
    setFormData({
      name: '',
      description: '',
      price: '14.00',
      stock: '10',
      image: PRESET_IMAGES[0].url,
      category: categories[0] || 'Tradicionais'
    });
    setIsAddingNewCat(false);
    setInlineNewCat('');
    setShowAddModal(true);
  };

  // Open Edit Modal
  const openEditModal = (prod) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      description: prod.description || '',
      price: prod.price.toString(),
      stock: prod.stock.toString(),
      image: prod.image,
      category: prod.category || categories[0] || 'Tradicionais'
    });
    setIsAddingNewCat(false);
    setInlineNewCat('');
  };

  // Handle image capture / upload
  const handlePhotoCapture = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      showToast('Processando foto da câmera/arquivo...', 'info');
      const compressedDataUrl = await compressImage(file);
      setFormData(prev => ({ ...prev, image: compressedDataUrl }));
      showToast('Foto capturada com sucesso! 📸');
    } catch (err) {
      console.error(err);
      showToast('Erro ao processar imagem.', 'error');
    }
    // reset input value so user can trigger same file if desired
    e.target.value = '';
  };

  // Inline new category save
  const handleSaveInlineCategory = () => {
    const trimmed = inlineNewCat.trim();
    if (!trimmed) return;
    if (!categories.includes(trimmed)) {
      const updated = [...categories, trimmed];
      setCategories(updated);
      api.updateSettings({ categories: updated }).catch(console.error);
    }
    setFormData(prev => ({ ...prev, category: trimmed }));
    setIsAddingNewCat(false);
    setInlineNewCat('');
  };

  // Submit Add
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const created = await api.createProduct({
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock) || 0
      });
      setShowAddModal(false);
      await loadAll();
      showToast(`Sabor "${created.name}" cadastrado com sucesso! 🍰`);
    } catch (err) {
      showToast(err.message || 'Erro ao cadastrar', 'error');
    }
  };

  // Submit Edit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      const updated = await api.updateProduct(editingProduct.id, {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock) || 0
      });
      setEditingProduct(null);
      await loadAll();
      showToast(`Sabor "${updated.name}" atualizado!`);
    } catch (err) {
      showToast(err.message || 'Erro ao atualizar', 'error');
    }
  };

  // Confirm Delete
  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;
    try {
      await api.deleteProduct(deletingProduct.id);
      setDeletingProduct(null);
      await loadAll();
      showToast('Sabor excluído com sucesso.');
    } catch (err) {
      showToast(err.message || 'Erro ao excluir', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Hidden file inputs for Camera and Gallery upload */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={cameraInputRef}
        onChange={handlePhotoCapture}
        className="hidden"
      />
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handlePhotoCapture}
        className="hidden"
      />

      {/* Toast Alert */}
      {feedback && (
        <div className={`p-4 rounded-2xl border text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-lg transition-all ${
          feedback.type === 'error'
            ? 'bg-rose-50 border-rose-200 text-rose-800'
            : feedback.type === 'info'
            ? 'bg-blue-50 border-blue-200 text-blue-800'
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          {feedback.type === 'error' ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <Check className="w-4 h-4 shrink-0" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Header and Action tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#3D2314]">
            Gestão de Estoque & Sabores 🫙
          </h1>
          <p className="text-xs sm:text-sm text-[#8C5338]">
            Tire fotos dos bolos direto da câmera, gerencie categorias personalizadas e ajuste o estoque
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 bg-[#E86A8D] hover:bg-[#C73866] text-white px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold shadow-md shadow-[#E86A8D]/20 transition-all active:scale-95"
          >
            <PackagePlus className="w-4 h-4" />
            <span>Cadastrar Novo Sabor</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#F5E6DC] gap-4">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'inventory'
              ? 'border-[#E86A8D] text-[#E86A8D]'
              : 'border-transparent text-[#8C5338] hover:text-[#3D2314]'
          }`}
        >
          <span>Estoque Atual ({products.length} sabores)</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'history'
              ? 'border-[#E86A8D] text-[#E86A8D]'
              : 'border-transparent text-[#8C5338] hover:text-[#3D2314]'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Histórico de Entradas e Saídas ({history.length})</span>
        </button>
      </div>

      {/* TAB 1: INVENTORY LIST */}
      {activeTab === 'inventory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(prod => {
            const isOutOfStock = prod.stock <= 0;
            const isLowStock = prod.stock > 0 && prod.stock < 5;

            return (
              <div
                key={prod.id}
                className="bg-white rounded-3xl p-5 border border-[#F5E6DC] shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-20 h-20 rounded-2xl object-cover bg-gray-100 shrink-0 border border-[#F5E6DC]"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80';
                    }}
                  />

                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-[#8C5338] bg-[#FFF9F4] px-2 py-0.5 rounded-md border border-[#F5E6DC]">
                      {prod.category || 'Tradicional'}
                    </span>
                    <h3 className="font-extrabold text-base text-[#3D2314] mt-1 truncate">
                      {prod.name}
                    </h3>
                    <p className="text-xs text-[#8C5338] line-clamp-1 mt-0.5">
                      {prod.description}
                    </p>
                    <span className="text-sm font-black text-[#E86A8D] block mt-1">
                      {formatBRL(prod.price)}
                    </span>
                  </div>
                </div>

                {/* Stock Controls */}
                <div className="p-3 bg-[#FFF9F4] rounded-2xl border border-[#F5E6DC] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#8C5338] uppercase block">
                      Estoque Atual
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xl font-black text-[#3D2314]">
                        {prod.stock} un
                      </span>
                      {isOutOfStock ? (
                        <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Esgotado
                        </span>
                      ) : isLowStock ? (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Baixo (&lt;5)
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Fast +/- delta buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleStockDelta(prod.id, -1, 'Redução rápida (−1)')}
                      disabled={prod.stock <= 0}
                      className="w-8 h-8 rounded-xl bg-white border border-[#F5E6DC] text-[#8C5338] hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-xs"
                      title="Diminuir 1 un"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleStockDelta(prod.id, 1, 'Reposição rápida (+1)')}
                      className="w-8 h-8 rounded-xl bg-white border border-[#F5E6DC] text-[#8C5338] hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 flex items-center justify-center transition-colors shadow-xs"
                      title="Adicionar 1 un"
                    >
                      <Plus className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleStockDelta(prod.id, 5, 'Fornada rápida (+5)')}
                      className="px-2 h-8 rounded-xl bg-white border border-[#F5E6DC] text-xs font-bold text-[#8C5338] hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 flex items-center justify-center transition-colors shadow-xs"
                      title="Adicionar fornada de 5 un"
                    >
                      +5
                    </button>
                  </div>
                </div>

                {/* Edit & Delete actions */}
                <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#F5E6DC]/40">
                  <button
                    onClick={() => openEditModal(prod)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#8C5338] hover:text-[#3D2314] px-2.5 py-1.5 rounded-lg hover:bg-[#FFF9F4] transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>

                  <button
                    onClick={() => setDeletingProduct(prod)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-800 px-2.5 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Excluir</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: AUDIT HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-3xl border border-[#F5E6DC] shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[#F5E6DC]">
            <h3 className="font-extrabold text-base text-[#3D2314]">
              Histórico Completo de Movimentações
            </h3>
            <p className="text-xs text-[#8C5338]">
              Registros automáticos de saídas por vendas, devoluções por cancelamento e ajustes manuais
            </p>
          </div>

          {history.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#8C5338]">
              Nenhum histórico registrado ainda.
            </div>
          ) : (
            <div className="divide-y divide-[#F5E6DC]/60 max-h-[600px] overflow-y-auto">
              {history.map(item => {
                const isEntry = item.type === 'ENTRY' || item.quantityDelta > 0;

                return (
                  <div key={item.id} className="p-4 flex items-center justify-between gap-4 hover:bg-[#FFF9F4]/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isEntry ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {isEntry ? <ArrowUpCircle className="w-5 h-5" /> : <ArrowDownCircle className="w-5 h-5" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs sm:text-sm text-[#3D2314]">
                            {item.productName || 'Sabor'}
                          </span>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            isEntry ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {isEntry ? `+${item.quantityDelta} un (Entrada)` : `${item.quantityDelta} un (Saída)`}
                          </span>
                        </div>
                        <p className="text-xs text-[#8C5338] mt-0.5">
                          {item.reason}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[11px] text-[#8C5338] block">
                        Saldo após: <strong className="text-[#3D2314]">{item.newStock} un</strong>
                      </span>
                      <span className="text-[10px] text-[#8C5338]/70">
                        {new Date(item.timestamp).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL: ADD / EDIT FLAVOR WITH CAMERA & CUSTOM CATEGORY */}
      {(showAddModal || editingProduct) && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-[#F5E6DC] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#F5E6DC]">
              <h3 className="font-extrabold text-lg text-[#3D2314] flex items-center gap-2">
                <span>🍰</span>
                <span>{editingProduct ? `Editar Sabor: ${editingProduct.name}` : 'Cadastrar Novo Sabor de Bolo'}</span>
              </h3>
              <button
                onClick={() => { setShowAddModal(false); setEditingProduct(null); }}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editingProduct ? handleEditSubmit : handleCreateSubmit} className="space-y-4">
              {/* Photo Area: Camera, Upload & Preview */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#8C5338]">
                  Foto do Bolo de Pote
                </label>

                <div className="flex items-center gap-4 p-3 bg-[#FFF9F4] rounded-2xl border border-[#F5E6DC]">
                  {/* Photo Preview */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 border border-[#F5E6DC] shrink-0">
                    {formData.image ? (
                      <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🍰</div>
                    )}
                  </div>

                  {/* Actions for Camera & Gallery */}
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 bg-[#E86A8D] hover:bg-[#C73866] text-white px-3 py-2 rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Tirar Foto (Câmera)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 bg-white hover:bg-gray-50 text-[#3D2314] border border-[#F5E6DC] px-3 py-2 rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95"
                      >
                        <Upload className="w-4 h-4 text-[#8C5338]" />
                        <span>Escolher Arquivo</span>
                      </button>
                    </div>

                    <p className="text-[10px] text-[#8C5338]">
                      Tire foto direto do pote de bolo pelo celular ou selecione do computador.
                    </p>
                  </div>
                </div>

                {/* Optional Preset Image Selector or Link */}
                <details className="text-xs text-[#8C5338]">
                  <summary className="cursor-pointer font-bold hover:text-[#E86A8D] py-1">
                    Ou usar link da web / fotos de exemplo
                  </summary>
                  <div className="pt-2 space-y-2">
                    <input
                      type="url"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-3 py-2 rounded-xl border border-[#F5E6DC] text-xs focus:outline-none focus:ring-1 focus:ring-[#E86A8D]"
                    />
                    <div className="grid grid-cols-3 gap-1.5">
                      {PRESET_IMAGES.map((preset, idx) => (
                        <button
                          type="button"
                          key={idx}
                          onClick={() => setFormData({ ...formData, image: preset.url })}
                          className="text-[10px] font-bold p-1 rounded-lg border border-[#F5E6DC] text-left flex items-center gap-1 hover:bg-[#FBE8EE]"
                        >
                          <img src={preset.url} alt="" className="w-4 h-4 rounded object-cover" />
                          <span className="truncate">{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </details>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-[#8C5338] mb-1">
                  Nome do Sabor *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Ninho com Nutella Artesanal"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#F5E6DC] text-sm focus:outline-none focus:ring-2 focus:ring-[#E86A8D]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-[#8C5338] mb-1">
                  Descrição detalhada
                </label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Camadas generosas de massa, recheio..."
                  className="w-full px-4 py-2 rounded-xl border border-[#F5E6DC] text-sm focus:outline-none focus:ring-2 focus:ring-[#E86A8D]"
                ></textarea>
              </div>

              {/* Price, Stock and Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#8C5338] mb-1">
                    Preço (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.50"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="14.50"
                    className="w-full px-3 py-2 rounded-xl border border-[#F5E6DC] text-sm focus:outline-none focus:ring-2 focus:ring-[#E86A8D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#8C5338] mb-1">
                    Estoque *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="10"
                    className="w-full px-3 py-2 rounded-xl border border-[#F5E6DC] text-sm focus:outline-none focus:ring-2 focus:ring-[#E86A8D]"
                  />
                </div>

                {/* Dynamic Category Selector */}
                <div>
                  <label className="block text-xs font-bold text-[#8C5338] mb-1 flex items-center justify-between">
                    <span>Categoria</span>
                    {!isAddingNewCat && (
                      <button
                        type="button"
                        onClick={() => setIsAddingNewCat(true)}
                        className="text-[10px] text-[#E86A8D] font-bold hover:underline"
                      >
                        + Nova
                      </button>
                    )}
                  </label>

                  {!isAddingNewCat ? (
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#F5E6DC] text-sm focus:outline-none focus:ring-2 focus:ring-[#E86A8D]"
                    >
                      {categories.map((cat, idx) => (
                        <option key={idx} value={cat}>{cat}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={inlineNewCat}
                        onChange={(e) => setInlineNewCat(e.target.value)}
                        placeholder="Nome..."
                        className="w-full px-2 py-1.5 rounded-lg border border-[#F5E6DC] text-xs focus:ring-1 focus:ring-[#E86A8D]"
                      />
                      <button
                        type="button"
                        onClick={handleSaveInlineCategory}
                        className="bg-[#E86A8D] text-white p-1.5 rounded-lg text-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAddingNewCat(false)}
                        className="text-gray-400 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-[#F5E6DC] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setEditingProduct(null); }}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#8C5338] hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#E86A8D] hover:bg-[#C73866] text-white text-xs font-bold shadow-md shadow-[#E86A8D]/20 active:scale-95 transition-all"
                >
                  {editingProduct ? 'Salvar Alterações' : 'Cadastrar Sabor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 border border-[#F5E6DC] shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto text-2xl">
              🗑️
            </div>
            <h3 className="font-extrabold text-lg text-[#3D2314]">
              Excluir Sabor?
            </h3>
            <p className="text-xs text-[#8C5338]">
              Tem certeza que deseja remover <strong>"{deletingProduct.name}"</strong>? O item deixará de aparecer no cardápio de clientes.
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingProduct(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#8C5338] bg-gray-100 hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
