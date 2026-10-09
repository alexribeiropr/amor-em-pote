import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Sparkles, Check, AlertCircle, Plus, Minus, Info, X, Heart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState({
    isOpen: true,
    businessHours: 'Terça a Domingo: 13:00 às 21:00',
    closedMessage: 'Segunda-feira: Fechado para produção',
    categories: ['Tradicionais', 'Especiais', 'Premium', 'Frutas']
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [notification, setNotification] = useState(null);

  const { cart, addToCart, updateQuantity, totalItems, subtotal } = useCart();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodsData, confData] = await Promise.all([
        api.getProducts(),
        api.getSettings()
      ]);
      setProducts(prodsData || []);
      if (confData) setSettings(confData);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3200);
  };

  const handleAddToCart = (product) => {
    const res = addToCart(product, 1);
    if (res.success) {
      showToast(`+1 ${product.name} no carrinho! 🍰`);
    } else {
      showToast(res.message, 'error');
    }
  };

  // Combine categories from settings and products
  const configuredCategories = settings.categories || ['Tradicionais', 'Especiais', 'Premium', 'Frutas'];
  const productCategories = products.map(p => p.category).filter(Boolean);
  const allUniqueCategories = Array.from(new Set([...configuredCategories, ...productCategories]));
  const categories = ['Todos', ...allUniqueCategories];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatBRL = (val) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="min-h-screen pb-28">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-4 left-4 sm:left-auto sm:w-96 z-50">
          <div className={`p-4 rounded-2xl shadow-xl border flex items-center gap-3 backdrop-blur-md transition-all transform animate-bounce ${
            notification.type === 'error'
              ? 'bg-rose-50/95 border-rose-200 text-rose-800'
              : 'bg-[#FDF2F4]/95 border-[#E85D88]/30 text-[#2C1810]'
          }`}>
            {notification.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            ) : (
              <Check className="w-5 h-5 text-[#E85D88] shrink-0" />
            )}
            <p className="text-sm font-bold">{notification.message}</p>
          </div>
        </div>
      )}

      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#FDF2F4] via-[#FFFDF9] to-[#FFFDF9] pt-8 sm:pt-12 pb-12 sm:pb-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Logo Badge & Tagline */}
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="relative group mb-3">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-white shadow-xl shadow-[#E86A8D]/25 ring-4 ring-[#FAD2DF]/60 bg-white">
                <img src="/logo.jpg" alt="Logo Amor em Pote" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <span className="absolute -bottom-1 -right-1 bg-white border border-[#FAD2DF] text-xs px-2 py-0.5 rounded-full shadow-xs font-bold text-[#A8325B] flex items-center gap-1">
                <span>❤️</span> Feito com amor
              </span>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/95 backdrop-blur-xs border border-[#FAD2DF] text-[#A8325B] text-xs font-black shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#E86A8D]" />
                <span>Qualidade em cada pote • Sabor que faz bem!</span>
              </div>

              {/* Store Status Indicator */}
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black shadow-xs ${
                settings.isOpen !== false
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                <span className={`w-2 h-2 rounded-full ${settings.isOpen !== false ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                <span>{settings.isOpen !== false ? `Aberto agora • ${settings.businessHours || '13:00 às 21:00'}` : (settings.closedMessage || 'Fechado temporariamente')}</span>
              </div>
            </div>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#3D2314] tracking-tight leading-[1.15] mb-3">
            Mais que doces, <span className="font-pacifico text-[#A8325B] drop-shadow-xs">momentos especiais!</span> 💕
          </h1>

          <p className="text-[#6B3A2A] text-sm sm:text-base max-w-xl mx-auto font-medium leading-relaxed">
            Doces artesanais preparados com ingredientes selecionados e carinho de verdade. Escolha seus sabores favoritos e peça direto no WhatsApp!
          </p>

          {/* Search bar */}
          <div className="mt-8 max-w-md mx-auto relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A05A36]/60 group-focus-within:text-[#E85D88] transition-colors" />
            <input
              type="text"
              placeholder="Buscar por sabor (ex: Nutella, Morango, Cenoura)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-white border border-[#F2E5D9] text-sm text-[#2C1810] placeholder-[#A05A36]/50 shadow-[0_4px_20px_-4px_rgba(66,32,16,0.05)] focus:outline-none focus:ring-2 focus:ring-[#E85D88]/40 focus:border-[#E85D88] transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Pills Slider */}
          <div className="w-full overflow-x-auto pb-3 pt-1 px-4 no-scrollbar">
            <div className="flex items-center justify-start sm:justify-center gap-2 min-w-max mx-auto">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 sm:px-5 py-2 rounded-2xl text-xs sm:text-sm font-extrabold transition-all duration-200 shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-[#E85D88] text-white shadow-md shadow-[#E85D88]/30 scale-105'
                      : 'bg-white text-[#7C4A2D] hover:bg-[#FDF2F4] hover:text-[#2C1810] border border-[#F2E5D9] shadow-xs'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Product Showcase Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mt-6">
        <div className="flex items-center justify-between mb-8 pb-3 border-b border-[#F2E5D9]">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#2C1810]">
              Cardápio de Hoje
            </h2>
            <p className="text-xs sm:text-sm text-[#7C4A2D] font-medium">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'sabor disponível' : 'sabores disponíveis'}
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-[#7C4A2D] bg-white px-3.5 py-1.5 rounded-full border border-[#F2E5D9] shadow-xs">
            <Info className="w-3.5 h-3.5 text-[#E85D88]" />
            <span>Potes de 250ml</span>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-3xl p-5 border border-[#F2E5D9] shadow-cake animate-pulse space-y-4">
                <div className="h-52 bg-[#F9EFE7] rounded-2xl"></div>
                <div className="h-5 bg-[#F9EFE7] rounded w-3/4"></div>
                <div className="h-4 bg-[#F9EFE7] rounded w-full"></div>
                <div className="h-10 bg-[#F9EFE7] rounded-2xl"></div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#F2E5D9] shadow-cake max-w-md mx-auto space-y-3">
            <span className="text-5xl block mb-2">🔍</span>
            <h3 className="font-black text-lg text-[#2C1810]">Nenhum sabor encontrado</h3>
            <p className="text-xs text-[#7C4A2D]">Tente buscar por outro termo ou escolha outra categoria.</p>
            <button
              onClick={() => { setSearchTerm(''); setSelectedCategory('Todos'); }}
              className="text-xs font-bold text-[#E85D88] hover:underline pt-2 block mx-auto"
            >
              Ver todos os sabores
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredProducts.map(product => {
              const isOutOfStock = product.stock <= 0;
              const isLowStock = product.stock > 0 && product.stock < 5;
              const cartItem = cart.find(it => it.productId === product.id);
              const inCartQty = cartItem ? cartItem.quantity : 0;

              return (
                <div
                  key={product.id}
                  className={`group bg-white rounded-3xl border border-[#F2E5D9] overflow-hidden shadow-cake hover:shadow-cake-hover hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between ${
                    isOutOfStock ? 'opacity-75' : ''
                  }`}
                >
                  {/* Photo Container */}
                  <div className="relative h-56 sm:h-60 w-full overflow-hidden bg-[#F9EFE7]">
                    <img
                      src={product.image}
                      alt={product.name}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80';
                      }}
                      className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108 ${
                        isOutOfStock ? 'grayscale-[60%]' : ''
                      }`}
                    />

                    {/* Gradient Overlay bottom of photo */}
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

                    {/* Category Pill Badge */}
                    <span className="absolute top-3.5 left-3.5 bg-white/95 backdrop-blur-md text-[#7C4A2D] text-[11px] font-black px-3 py-1 rounded-full shadow-xs border border-white/60">
                      {product.category || 'Tradicional'}
                    </span>

                    {/* Stock Status Badge */}
                    <div className="absolute top-3.5 right-3.5">
                      {isOutOfStock ? (
                        <span className="bg-rose-600/95 text-white text-xs font-black px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                          <span>Esgotado</span>
                        </span>
                      ) : isLowStock ? (
                        <span className="bg-gradient-to-r from-amber-500 to-rose-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-md flex items-center gap-1 animate-pulse">
                          <span>Últimas {product.stock} un! 🔥</span>
                        </span>
                      ) : (
                        <span className="bg-emerald-600/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs backdrop-blur-xs">
                          {product.stock} un
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="font-black text-lg text-[#2C1810] group-hover:text-[#E85D88] transition-colors leading-snug">
                        {product.name}
                      </h3>
                      <p className="text-xs text-[#7C4A2D] mt-2 leading-relaxed line-clamp-2 font-medium">
                        {product.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[#F2E5D9]/70 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#A05A36] block tracking-wider">
                          Valor
                        </span>
                        <span className="text-xl font-black text-[#2C1810]">
                          {formatBRL(product.price)}
                        </span>
                      </div>

                      {/* Add button / Counter */}
                      {isOutOfStock ? (
                        <span className="px-4 py-2.5 rounded-2xl font-bold text-xs bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed">
                          Esgotado
                        </span>
                      ) : inCartQty > 0 ? (
                        <div className="flex items-center gap-1.5 bg-[#FDF2F4] border border-[#E85D88]/40 rounded-2xl p-1 shadow-xs">
                          <button
                            onClick={() => updateQuantity(product.id, inCartQty - 1, product.stock)}
                            className="w-7 h-7 rounded-xl bg-white text-[#E85D88] hover:bg-[#E85D88] hover:text-white flex items-center justify-center transition-colors shadow-xs"
                            title="Diminuir"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-6 text-center text-xs font-black text-[#2C1810]">
                            {inCartQty}
                          </span>
                          <button
                            onClick={() => updateQuantity(product.id, inCartQty + 1, product.stock)}
                            disabled={inCartQty >= product.stock}
                            className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors shadow-xs ${
                              inCartQty >= product.stock
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-[#E85D88] hover:bg-[#E85D88] hover:text-white'
                            }`}
                            title="Aumentar"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm bg-[#E85D88] hover:bg-[#C73866] text-white shadow-md shadow-[#E85D88]/25 transition-all duration-200 flex items-center gap-1.5 active:scale-95 hover:scale-[1.02]"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Adicionar</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Floating Bottom Cart Bar */}
      {totalItems > 0 && (
        <div className="fixed bottom-5 left-4 right-4 max-w-lg mx-auto z-40 animate-fade-in-up">
          <Link
            to="/carrinho"
            className="bg-[#2C1810] text-white p-3.5 sm:p-4 px-5 rounded-3xl shadow-float flex items-center justify-between border-2 border-[#E85D88] hover:bg-[#422006] transition-all transform hover:scale-[1.02] active:scale-95 group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#E85D88] to-[#FB7185] flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#FB7185] block uppercase tracking-wider">
                  {totalItems} {totalItems === 1 ? 'bolo no pote' : 'bolos no pote'}
                </span>
                <span className="text-base font-black text-white">
                  Total: {formatBRL(subtotal)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-[#E85D88] group-hover:bg-[#C73866] text-white px-4 py-2.5 rounded-2xl text-xs font-black shadow-sm transition-colors">
              <span>Ver Carrinho</span>
              <span>→</span>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
