// API client with seamless LocalStorage fallback for zero-configuration and standalone deployment

const LOCAL_STORAGE_KEY = 'amor_em_pote_data_v1';

const defaultSeed = {
  settings: {
    storeName: 'Amor em Pote - Doces Artesanais',
    sellerPhone: '24999762118',
    adminPassword: 'admin123',
    pixKey: 'contato@amorpote.com.br',
    deliveryFee: 5.00,
    estimatedDeliveryTime: '30 a 50 minutos',
    isOpen: true,
    businessHours: 'Terça a Domingo: 13:00 às 21:00',
    closedMessage: 'Segunda-feira: Fechado para produção artesanal',
    categories: ['Tradicionais', 'Especiais', 'Premium', 'Frutas']
  },
  products: [],
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

import { getSupabase } from './supabase';

export const api = {
  // Settings
  getSettings: async () => {
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb.from('store_settings').select('*').eq('id', 'main').single();
        if (!error && data) {
          return {
            storeName: data.store_name,
            sellerPhone: data.seller_phone,
            adminPassword: data.admin_password,
            pixKey: data.pix_key,
            deliveryFee: Number(data.delivery_fee),
            estimatedDeliveryTime: data.estimated_delivery_time,
            isOpen: Boolean(data.is_open),
            businessHours: data.business_hours,
            closedMessage: data.closed_message,
            categories: data.categories || ['Tradicionais', 'Especiais', 'Premium', 'Frutas']
          };
        }
      } catch (err) {
        console.warn('Erro ao consultar Supabase store_settings, usando fallback:', err);
      }
    }
    return request('/settings');
  },

  updateSettings: async (data) => {
    const sb = getSupabase();
    if (sb) {
      try {
        const payload = {
          id: 'main',
          store_name: data.storeName,
          seller_phone: data.sellerPhone,
          admin_password: data.adminPassword,
          pix_key: data.pixKey,
          delivery_fee: Number(data.deliveryFee) || 0,
          estimated_delivery_time: data.estimatedDeliveryTime,
          is_open: Boolean(data.isOpen),
          business_hours: data.businessHours,
          closed_message: data.closedMessage,
          categories: data.categories,
          updated_at: new Date().toISOString()
        };
        const { error } = await sb.from('store_settings').upsert(payload);
        if (!error) return { success: true, settings: data };
      } catch (err) {
        console.warn('Erro ao atualizar Supabase store_settings, usando fallback:', err);
      }
    }
    return request('/settings', { method: 'POST', body: JSON.stringify(data) });
  },

  // Products
  getProducts: async () => {
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb.from('products').select('*').order('created_at', { ascending: true });
        if (!error && data) {
          return data.map(p => ({
            id: p.id,
            name: p.name,
            description: p.description,
            price: Number(p.price),
            stock: Number(p.stock),
            image: p.image,
            category: p.category,
            active: p.active !== false
          }));
        }
      } catch (err) {
        console.warn('Erro ao buscar produtos no Supabase, usando fallback:', err);
      }
    }
    return request('/products');
  },

  createProduct: async (data) => {
    const sb = getSupabase();
    if (sb) {
      try {
        const newProduct = {
          id: 'p_' + Date.now(),
          name: data.name,
          description: data.description || '',
          price: Number(data.price),
          stock: Number(data.stock) || 0,
          image: data.image || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80',
          category: data.category || 'Tradicionais',
          active: true,
          created_at: new Date().toISOString()
        };
        const { error } = await sb.from('products').insert([newProduct]);
        if (!error) {
          // Registrar histórico
          await sb.from('stock_history').insert([{
            id: 'hist_' + Date.now(),
            timestamp: new Date().toISOString(),
            type: 'ENTRY',
            product_id: newProduct.id,
            product_name: newProduct.name,
            quantity_delta: newProduct.stock,
            new_stock: newProduct.stock,
            reason: 'Cadastro do produto com estoque inicial'
          }]).catch(() => {});
          return newProduct;
        }
      } catch (err) {
        console.warn('Erro ao criar produto no Supabase, usando fallback:', err);
      }
    }
    return request('/products', { method: 'POST', body: JSON.stringify(data) });
  },

  updateProduct: async (id, data) => {
    const sb = getSupabase();
    if (sb) {
      try {
        const payload = {
          name: data.name,
          description: data.description,
          price: Number(data.price),
          stock: Number(data.stock),
          image: data.image,
          category: data.category,
          active: data.active
        };
        const { error } = await sb.from('products').update(payload).eq('id', id);
        if (!error) return { id, ...data };
      } catch (err) {
        console.warn('Erro ao atualizar produto no Supabase, usando fallback:', err);
      }
    }
    return request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },

  adjustStock: async (id, delta, reason) => {
    const sb = getSupabase();
    if (sb) {
      try {
        const { data: prod } = await sb.from('products').select('*').eq('id', id).single();
        if (prod) {
          const newStock = Math.max(0, Number(prod.stock) + Number(delta));
          const actualDelta = newStock - Number(prod.stock);
          await sb.from('products').update({ stock: newStock }).eq('id', id);
          await sb.from('stock_history').insert([{
            id: 'hist_' + Date.now(),
            timestamp: new Date().toISOString(),
            type: actualDelta >= 0 ? 'ENTRY' : 'EXIT',
            product_id: prod.id,
            product_name: prod.name,
            quantity_delta: actualDelta,
            new_stock: newStock,
            reason: reason || (actualDelta > 0 ? 'Acréscimo manual (+)' : 'Redução manual (-)')
          }]).catch(() => {});
          return { ...prod, stock: newStock };
        }
      } catch (err) {
        console.warn('Erro ao ajustar estoque no Supabase, usando fallback:', err);
      }
    }
    return request(`/products/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ delta, reason })
    });
  },

  deleteProduct: async (id) => {
    const sb = getSupabase();
    if (sb) {
      try {
        const { error } = await sb.from('products').delete().eq('id', id);
        if (!error) return { success: true };
      } catch (err) {
        console.warn('Erro ao deletar produto no Supabase, usando fallback:', err);
      }
    }
    return request(`/products/${id}`, { method: 'DELETE' });
  },

  // Orders
  getOrders: async () => {
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb.from('orders').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          return data.map(o => ({
            id: o.id,
            createdAt: o.created_at,
            customer: o.customer,
            items: o.items,
            paymentMethod: o.payment_method,
            notes: o.notes,
            subtotal: Number(o.subtotal),
            deliveryFee: Number(o.delivery_fee),
            total: Number(o.total),
            status: o.status
          }));
        }
      } catch (err) {
        console.warn('Erro ao buscar pedidos no Supabase, usando fallback:', err);
      }
    }
    return request('/orders');
  },

  createOrder: async (data) => {
    const sb = getSupabase();
    if (sb) {
      try {
        const now = new Date();
        const orderId = 'PED-' + Math.floor(1000 + Math.random() * 9000);
        const { items, customer, paymentMethod, notes, deliveryFee } = data;

        // Atualizar estoque no Supabase
        for (const it of items) {
          const { data: prod } = await sb.from('products').select('*').eq('id', it.productId).single();
          if (prod) {
            const nextStock = Math.max(0, Number(prod.stock) - Number(it.quantity));
            await sb.from('products').update({ stock: nextStock }).eq('id', prod.id);
            await sb.from('stock_history').insert([{
              id: 'hist_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
              timestamp: now.toISOString(),
              type: 'EXIT',
              product_id: prod.id,
              product_name: prod.name,
              quantity_delta: -it.quantity,
              new_stock: nextStock,
              reason: `Saída automática - Pedido #${orderId}`
            }]).catch(() => {});
          }
        }

        const subtotal = items.reduce((acc, it) => acc + (it.price * it.quantity), 0);
        const fee = Number(deliveryFee) || 0;
        const total = subtotal + fee;

        const newOrder = {
          id: orderId,
          created_at: now.toISOString(),
          customer,
          items,
          payment_method: paymentMethod || 'PIX',
          notes: notes || '',
          subtotal,
          delivery_fee: fee,
          total,
          status: 'Novo'
        };

        const { error } = await sb.from('orders').insert([newOrder]);
        if (!error) {
          return {
            success: true,
            order: {
              ...newOrder,
              createdAt: newOrder.created_at,
              paymentMethod: newOrder.payment_method,
              deliveryFee: newOrder.delivery_fee
            }
          };
        }
      } catch (err) {
        console.warn('Erro ao criar pedido no Supabase, usando fallback:', err);
      }
    }
    return request('/orders', { method: 'POST', body: JSON.stringify(data) });
  },

  updateOrderStatus: async (id, status) => {
    const sb = getSupabase();
    if (sb) {
      try {
        const { data: oldOrder } = await sb.from('orders').select('*').eq('id', id).single();
        if (oldOrder && status === 'Cancelado' && oldOrder.status !== 'Cancelado') {
          // Restaurar estoque
          for (const it of (oldOrder.items || [])) {
            const { data: prod } = await sb.from('products').select('*').eq('id', it.productId).single();
            if (prod) {
              const restoredStock = Number(prod.stock) + Number(it.quantity);
              await sb.from('products').update({ stock: restoredStock }).eq('id', prod.id);
              await sb.from('stock_history').insert([{
                id: 'hist_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
                timestamp: new Date().toISOString(),
                type: 'ENTRY',
                product_id: prod.id,
                product_name: prod.name,
                quantity_delta: it.quantity,
                new_stock: restoredStock,
                reason: `Devolução ao estoque por cancelamento #${id}`
              }]).catch(() => {});
            }
          }
        }
        const { error } = await sb.from('orders').update({ status }).eq('id', id);
        if (!error) return { success: true, order: { id, status } };
      } catch (err) {
        console.warn('Erro ao atualizar status do pedido no Supabase, usando fallback:', err);
      }
    }
    return request(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  deleteOrder: async (id) => {
    const sb = getSupabase();
    if (sb) {
      try {
        const { error } = await sb.from('orders').delete().eq('id', id);
        if (!error) return { success: true };
      } catch (err) {
        console.warn('Erro ao deletar pedido no Supabase, usando fallback:', err);
      }
    }
    return request(`/orders/${id}`, { method: 'DELETE' });
  },

  clearAllOrders: async () => {
    const sb = getSupabase();
    if (sb) {
      try {
        const { error } = await sb.from('orders').delete().neq('id', '___non_existent___');
        if (!error) return { success: true };
      } catch (err) {
        console.warn('Erro ao limpar pedidos no Supabase, usando fallback:', err);
      }
    }
    return request('/orders', { method: 'DELETE' });
  },

  // Dashboard & Audit
  getDashboard: async () => {
    const sb = getSupabase();
    if (sb) {
      try {
        const [ordersRes, prodsRes] = await Promise.all([
          sb.from('orders').select('*'),
          sb.from('products').select('*')
        ]);
        if (!ordersRes.error && !prodsRes.error) {
          const orders = ordersRes.data || [];
          const products = prodsRes.data || [];
          const now = new Date();
          const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

          const nonCancelled = orders.filter(o => o.status !== 'Cancelado');
          const salesToday = nonCancelled
            .filter(o => new Date(o.created_at) >= startOfToday)
            .reduce((sum, o) => sum + Number(o.total || 0), 0);
          const salesWeek = nonCancelled
            .filter(o => new Date(o.created_at) >= sevenDaysAgo)
            .reduce((sum, o) => sum + Number(o.total || 0), 0);
          const salesMonth = nonCancelled
            .filter(o => new Date(o.created_at) >= startOfMonth)
            .reduce((sum, o) => sum + Number(o.total || 0), 0);

          const pendingOrders = orders.filter(o => o.status === 'Novo' || o.status === 'Em preparo').length;
          const lowStockProducts = products.filter(p => Number(p.stock) < 5);

          return {
            salesToday,
            salesWeek,
            salesMonth,
            pendingOrders,
            totalOrders: orders.length,
            lowStockCount: lowStockProducts.length,
            lowStockProducts
          };
        }
      } catch (err) {
        console.warn('Erro ao calcular dashboard no Supabase, usando fallback:', err);
      }
    }
    return request('/dashboard');
  },

  getStockHistory: async () => {
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb.from('stock_history').select('*').order('timestamp', { ascending: false }).limit(50);
        if (!error && data) {
          return data.map(h => ({
            id: h.id,
            timestamp: h.timestamp,
            type: h.type,
            productId: h.product_id,
            productName: h.product_name,
            quantityDelta: h.quantity_delta,
            newStock: h.new_stock,
            reason: h.reason
          }));
        }
      } catch (err) {
        console.warn('Erro ao carregar histórico no Supabase, usando fallback:', err);
      }
    }
    return request('/stock-history');
  },

  // Clear demo fake data (orders and history)
  clearDemoData: async () => {
    const sb = getSupabase();
    if (sb) {
      try {
        await sb.from('orders').delete().neq('id', '___none___');
        await sb.from('stock_history').delete().neq('id', '___none___');
        return { success: true };
      } catch (err) {
        console.warn('Erro ao limpar dados no Supabase, usando fallback:', err);
      }
    }
    return request('/clean-data', { method: 'POST' });
  },

  // Reset to default seed data if needed
  resetData: () => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(defaultSeed));
    return defaultSeed;
  }
};
