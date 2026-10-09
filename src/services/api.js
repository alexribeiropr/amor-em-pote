// API client with seamless LocalStorage fallback for zero-configuration and standalone deployment

const LOCAL_STORAGE_KEY = 'amor_em_pote_data_v1';

const defaultSeed = {
  settings: {
    storeName: 'Amor em Pote - Doces Artesanais',
    sellerPhone: '5511999998888',
    adminPassword: 'admin123',
    pixKey: 'contato@amorpote.com.br',
    deliveryFee: 5.00,
    estimatedDeliveryTime: '30 a 50 minutos',
    isOpen: true,
    businessHours: 'Terça a Domingo: 13:00 às 21:00',
    closedMessage: 'Segunda-feira: Fechado para produção artesanal',
    categories: ['Tradicionais', 'Especiais', 'Premium', 'Frutas']
  },
  products: [
    {
      id: 'p1',
      name: 'Ninho com Nutella',
      description: 'Massa fofinha de chocolate, recheio cremoso de leite Ninho e pura Nutella original.',
      price: 14.50,
      stock: 12,
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80',
      active: true,
      category: 'Tradicionais'
    },
    {
      id: 'p2',
      name: 'Cenoura com Brigadeiro Belga',
      description: 'Bolo de cenoura caseiro ultra macio, coberto com generosas camadas de brigadeiro 50% cacau.',
      price: 13.00,
      stock: 8,
      image: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?auto=format&fit=crop&w=600&q=80',
      active: true,
      category: 'Tradicionais'
    },
    {
      id: 'p3',
      name: 'Morango com Brigadeiro Branco',
      description: 'Pedaços frescos de morango, creme branco aveludado e pão de ló amanteigado.',
      price: 15.00,
      stock: 4,
      image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=600&q=80',
      active: true,
      category: 'Especiais'
    },
    {
      id: 'p4',
      name: 'Red Velvet com Cream Cheese',
      description: 'Massa aveludada vermelha com clássico recheio suave de cream cheese cítrico.',
      price: 16.00,
      stock: 3,
      image: 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?auto=format&fit=crop&w=600&q=80',
      active: true,
      category: 'Premium'
    },
    {
      id: 'p5',
      name: 'Maracujá Cremoso com Chocolate',
      description: 'Equilíbrio perfeito do mousse de maracujá artesanal com ganache de chocolate meio amargo.',
      price: 14.00,
      stock: 6,
      image: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=600&q=80',
      active: true,
      category: 'Frutas'
    },
    {
      id: 'p6',
      name: 'Prestígio Trufado',
      description: 'Bolo de chocolate molhadinho recheado com beijinho de coco úmido e raspas de coco ralado.',
      price: 13.50,
      stock: 0,
      image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
      active: true,
      category: 'Tradicionais'
    }
  ],
  orders: [],
  stockHistory: []
};

function getLocalStore() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(defaultSeed));
      return defaultSeed;
    }
    const parsed = JSON.parse(raw);
    parsed.settings = { ...defaultSeed.settings, ...(parsed.settings || {}) };
    if (!parsed.settings.categories || !parsed.settings.categories.length) {
      parsed.settings.categories = defaultSeed.settings.categories;
    }
    return parsed;
  } catch {
    return defaultSeed;
  }
}

function setLocalStore(data) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('LocalStorage write error:', err);
  }
}

// Check backend availability
let backendAvailable = true;

async function request(endpoint, options = {}) {
  // If backend is deemed available, try calling /api
  if (backendAvailable) {
    try {
      const res = await fetch(`/api${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        },
        ...options
      });

      // If backend returns 404 or HTML (e.g. Vercel static rewrite), gracefully fall back to LocalStorage!
      const contentType = res.headers.get('content-type') || '';
      if (!res.ok || !contentType.includes('application/json')) {
        console.warn(`Endpoint /api${endpoint} respondeu status ${res.status} ou não é JSON. Ativando modo local independente.`);
        backendAvailable = false;
      } else {
        return await res.json();
      }
    } catch (err) {
      console.warn('Backend Express não detectado. Usando armazenamento local (LocalStorage).', err.message);
      backendAvailable = false;
    }
  }

  // --- LOCAL FALLBACK LOGIC ---
  const store = getLocalStore();

  // Settings
  if (endpoint === '/settings' && (!options.method || options.method === 'GET')) {
    return store.settings;
  }
  if (endpoint === '/settings' && options.method === 'POST') {
    const body = JSON.parse(options.body);
    store.settings = { ...store.settings, ...body };
    setLocalStore(store);
    return { success: true, settings: store.settings };
  }

  // Products
  if (endpoint === '/products' && (!options.method || options.method === 'GET')) {
    return store.products;
  }
  if (endpoint === '/products' && options.method === 'POST') {
    const body = JSON.parse(options.body);
    const newProduct = {
      id: 'p_' + Date.now(),
      name: body.name,
      description: body.description || '',
      price: Number(body.price),
      stock: Number(body.stock) || 0,
      image: body.image || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80',
      active: true,
      category: body.category || 'Tradicionais'
    };
    store.products.push(newProduct);
    store.stockHistory.unshift({
      id: 'hist_' + Date.now(),
      timestamp: new Date().toISOString(),
      type: 'ENTRY',
      productId: newProduct.id,
      productName: newProduct.name,
      quantityDelta: newProduct.stock,
      newStock: newProduct.stock,
      reason: 'Cadastro do produto com estoque inicial'
    });
    setLocalStore(store);
    return newProduct;
  }

  if (endpoint.startsWith('/products/') && endpoint.endsWith('/stock') && options.method === 'PATCH') {
    const id = endpoint.split('/')[2];
    const body = JSON.parse(options.body);
    const product = store.products.find(p => p.id === id);
    if (!product) throw new Error('Produto não encontrado');

    const numDelta = Number(body.delta);
    const newStock = Math.max(0, product.stock + numDelta);
    const actualDelta = newStock - product.stock;
    product.stock = newStock;

    store.stockHistory.unshift({
      id: 'hist_' + Date.now(),
      timestamp: new Date().toISOString(),
      type: actualDelta >= 0 ? 'ENTRY' : 'EXIT',
      productId: product.id,
      productName: product.name,
      quantityDelta: actualDelta,
      newStock: product.stock,
      reason: body.reason || (actualDelta > 0 ? 'Acréscimo manual (+)' : 'Redução manual (-)')
    });
    setLocalStore(store);
    return product;
  }

  if (endpoint.startsWith('/products/') && options.method === 'PUT') {
    const id = endpoint.split('/')[2];
    const body = JSON.parse(options.body);
    const index = store.products.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Produto não encontrado');

    const oldProduct = store.products[index];
    const updated = {
      ...oldProduct,
      ...body,
      price: body.price !== undefined ? Number(body.price) : oldProduct.price,
      stock: body.stock !== undefined ? Number(body.stock) : oldProduct.stock
    };

    if (body.stock !== undefined && body.stock !== oldProduct.stock) {
      const delta = updated.stock - oldProduct.stock;
      store.stockHistory.unshift({
        id: 'hist_' + Date.now(),
        timestamp: new Date().toISOString(),
        type: delta > 0 ? 'ENTRY' : 'EXIT',
        productId: updated.id,
        productName: updated.name,
        quantityDelta: delta,
        newStock: updated.stock,
        reason: 'Ajuste manual de estoque via edição'
      });
    }

    store.products[index] = updated;
    setLocalStore(store);
    return updated;
  }

  if (endpoint.startsWith('/products/') && options.method === 'DELETE') {
    const id = endpoint.split('/')[2];
    const index = store.products.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Produto não encontrado');
    const removed = store.products.splice(index, 1)[0];
    setLocalStore(store);
    return { success: true, removed };
  }

  // Orders
  if (endpoint === '/orders' && (!options.method || options.method === 'GET')) {
    return [...store.orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  if (endpoint === '/orders' && options.method === 'POST') {
    const body = JSON.parse(options.body);
    const { customer, items, paymentMethod, notes, deliveryFee } = body;

    // RULE: Check stock availability
    for (const item of items) {
      const product = store.products.find(p => p.id === item.productId);
      if (!product) throw new Error(`Sabor "${item.name}" não encontrado.`);
      if (product.stock < item.quantity) {
        throw new Error(`Estoque insuficiente para "${product.name}". Disponível: ${product.stock}, Solicitado: ${item.quantity}.`);
      }
    }

    // Debit stock automatically
    const now = new Date();
    const orderId = 'PED-' + Math.floor(1000 + Math.random() * 9000);

    items.forEach(item => {
      const product = store.products.find(p => p.id === item.productId);
      if (product) {
        product.stock -= item.quantity;
        store.stockHistory.unshift({
          id: 'hist_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          timestamp: now.toISOString(),
          type: 'EXIT',
          productId: product.id,
          productName: product.name,
          quantityDelta: -item.quantity,
          newStock: product.stock,
          reason: `Saída automática - Pedido #${orderId}`
        });
      }
    });

    const subtotal = items.reduce((acc, it) => acc + (it.price * it.quantity), 0);
    const fee = Number(deliveryFee) || Number(store.settings.deliveryFee) || 0;
    const total = subtotal + fee;

    const newOrder = {
      id: orderId,
      createdAt: now.toISOString(),
      customer,
      paymentMethod: paymentMethod || 'PIX',
      notes: notes || '',
      items,
      subtotal,
      deliveryFee: fee,
      total,
      status: 'Novo'
    };

    store.orders.unshift(newOrder);
    setLocalStore(store);
    return { success: true, order: newOrder };
  }

  if (endpoint.startsWith('/orders/') && endpoint.endsWith('/status') && options.method === 'PATCH') {
    const id = endpoint.split('/')[2];
    const body = JSON.parse(options.body);
    const order = store.orders.find(o => o.id === id);
    if (!order) throw new Error('Pedido não encontrado');

    const oldStatus = order.status;
    const newStatus = body.status;

    // RULE: If cancelling, RESTORE stock!
    if (newStatus === 'Cancelado' && oldStatus !== 'Cancelado') {
      order.items.forEach(item => {
        const product = store.products.find(p => p.id === item.productId);
        if (product) {
          product.stock += item.quantity;
          store.stockHistory.unshift({
            id: 'hist_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            timestamp: new Date().toISOString(),
            type: 'ENTRY',
            productId: product.id,
            productName: product.name,
            quantityDelta: item.quantity,
            newStock: product.stock,
            reason: `Devolução ao estoque por cancelamento do Pedido #${order.id}`
          });
        }
      });
    }

    order.status = newStatus;
    setLocalStore(store);
    return { success: true, order };
  }

  // Delete single order
  if (endpoint.startsWith('/orders/') && options.method === 'DELETE') {
    const id = endpoint.split('/')[2];
    const index = store.orders.findIndex(o => o.id === id);
    if (index === -1) throw new Error('Pedido não encontrado');
    const removed = store.orders.splice(index, 1)[0];
    setLocalStore(store);
    return { success: true, removed };
  }

  // Delete all orders
  if (endpoint === '/orders' && options.method === 'DELETE') {
    store.orders = [];
    setLocalStore(store);
    return { success: true };
  }

  // Clear demo data (orders and history)
  if (endpoint === '/clean-data' && options.method === 'POST') {
    store.orders = [];
    store.stockHistory = [];
    setLocalStore(store);
    return { success: true };
  }

  // Dashboard Stats
  if (endpoint === '/dashboard' && (!options.method || options.method === 'GET')) {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const nonCancelled = store.orders.filter(o => o.status !== 'Cancelado');

    const salesToday = nonCancelled
      .filter(o => new Date(o.createdAt) >= startOfToday)
      .reduce((sum, o) => sum + (o.total || 0), 0);

    const salesWeek = nonCancelled
      .filter(o => new Date(o.createdAt) >= sevenDaysAgo)
      .reduce((sum, o) => sum + (o.total || 0), 0);

    const salesMonth = nonCancelled
      .filter(o => new Date(o.createdAt) >= startOfMonth)
      .reduce((sum, o) => sum + (o.total || 0), 0);

    const pendingOrders = store.orders.filter(o => o.status === 'Novo' || o.status === 'Em preparo').length;
    const lowStockProducts = store.products.filter(p => p.stock < 5);

    return {
      salesToday,
      salesWeek,
      salesMonth,
      pendingOrders,
      totalOrders: store.orders.length,
      lowStockCount: lowStockProducts.length,
      lowStockProducts
    };
  }

  // Stock History
  if (endpoint === '/stock-history' && (!options.method || options.method === 'GET')) {
    return store.stockHistory;
  }

  return {};
}

export const api = {
  // Settings
  getSettings: () => request('/settings'),
  updateSettings: (data) => request('/settings', { method: 'POST', body: JSON.stringify(data) }),

  // Products
  getProducts: () => request('/products'),
  createProduct: (data) => request('/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id, data) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  adjustStock: (id, delta, reason) => request(`/products/${id}/stock`, {
    method: 'PATCH',
    body: JSON.stringify({ delta, reason })
  }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),

  // Orders
  getOrders: () => request('/orders'),
  createOrder: (data) => request('/orders', { method: 'POST', body: JSON.stringify(data) }),
  updateOrderStatus: (id, status) => request(`/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  }),
  deleteOrder: (id) => request(`/orders/${id}`, { method: 'DELETE' }),
  clearAllOrders: () => request('/orders', { method: 'DELETE' }),

  // Dashboard & Audit
  getDashboard: () => request('/dashboard'),
  getStockHistory: () => request('/stock-history'),

  // Clear demo fake data (orders and history)
  clearDemoData: () => request('/clean-data', { method: 'POST' }),

  // Reset to default seed data if needed
  resetData: () => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(defaultSeed));
    return defaultSeed;
  }
};
