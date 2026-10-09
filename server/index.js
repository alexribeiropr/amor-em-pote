import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const DATA_DIR = path.join(__dirname, 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial default seed data
const initialData = {
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
      stock: 4, // alerta estoque baixo (<5)
      image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=600&q=80',
      active: true,
      category: 'Especiais'
    },
    {
      id: 'p4',
      name: 'Red Velvet com Cream Cheese',
      description: 'Massa aveludada vermelha com clássico recheio suave de cream cheese cítrico.',
      price: 16.00,
      stock: 3, // alerta estoque baixo (<5)
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
      stock: 0, // esgotado de exemplo para testar regra de negócio
      image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
      active: true,
      category: 'Tradicionais'
    }
  ],
  orders: [
    {
      id: 'PED-1001',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      customer: {
        name: 'Mariana Souza',
        phone: '11987654321',
        street: 'Rua das Flores',
        number: '124',
        neighborhood: 'Jardim Primavera',
        complement: 'Apto 42',
        reference: 'Próximo à padaria'
      },
      paymentMethod: 'PIX',
      notes: 'Por favor, caprichar no guardanapo e colher.',
      items: [
        { productId: 'p1', name: 'Ninho com Nutella', quantity: 2, price: 14.50 },
        { productId: 'p3', name: 'Morango com Brigadeiro Branco', quantity: 1, price: 15.00 }
      ],
      subtotal: 44.00,
      deliveryFee: 5.00,
      total: 49.00,
      status: 'Entregue'
    },
    {
      id: 'PED-1002',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      customer: {
        name: 'Lucas Ferreira',
        phone: '11976543210',
        street: 'Av. Paulista',
        number: '1500',
        neighborhood: 'Bela Vista',
        complement: 'Conjunto 81',
        reference: 'Em frente ao MASP'
      },
      paymentMethod: 'Cartão',
      notes: '',
      items: [
        { productId: 'p2', name: 'Cenoura com Brigadeiro Belga', quantity: 1, price: 13.00 }
      ],
      subtotal: 13.00,
      deliveryFee: 5.00,
      total: 18.00,
      status: 'Em preparo'
    }
  ],
  stockHistory: [
    {
      id: 'hist-1',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      type: 'ENTRY',
      productId: 'p1',
      productName: 'Ninho com Nutella',
      quantityDelta: 15,
      newStock: 15,
      reason: 'Produção inicial de fornada'
    },
    {
      id: 'hist-2',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      type: 'EXIT',
      productId: 'p1',
      productName: 'Ninho com Nutella',
      quantityDelta: -2,
      newStock: 13,
      reason: 'Venda - Pedido #PED-1001'
    },
    {
      id: 'hist-3',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      type: 'EXIT',
      productId: 'p3',
      productName: 'Morango com Brigadeiro Branco',
      quantityDelta: -1,
      newStock: 4,
      reason: 'Venda - Pedido #PED-1001'
    },
    {
      id: 'hist-4',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      type: 'EXIT',
      productId: 'p2',
      productName: 'Cenoura com Brigadeiro Belga',
      quantityDelta: -1,
      newStock: 8,
      reason: 'Venda - Pedido #PED-1002'
    }
  ]
};

// Database helper functions
function loadData() {
  try {
    if (!fs.existsSync(STORE_FILE)) {
      saveData(initialData);
      return initialData;
    }
    const raw = fs.readFileSync(STORE_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    parsed.settings = { ...initialData.settings, ...(parsed.settings || {}) };
    if (!parsed.settings.categories || !parsed.settings.categories.length) {
      parsed.settings.categories = initialData.settings.categories;
    }
    return parsed;
  } catch (err) {
    console.error('Error reading store.json, using defaults:', err);
    return initialData;
  }
}

function saveData(data) {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing store.json:', err);
  }
}

// ----------------- API ROUTES -----------------

// 1. GET Settings
app.get('/api/settings', (req, res) => {
  const data = loadData();
  res.json(data.settings);
});

// Update Settings
app.post('/api/settings', (req, res) => {
  const data = loadData();
  data.settings = { ...data.settings, ...req.body };
  saveData(data);
  res.json({ success: true, settings: data.settings });
});

// 2. GET Products
app.get('/api/products', (req, res) => {
  const data = loadData();
  res.json(data.products || []);
});

// 3. POST Product (Create)
app.post('/api/products', (req, res) => {
  const data = loadData();
  const { name, description, price, stock, image, category } = req.body;

  if (!name || price === undefined) {
    return res.status(400).json({ error: 'Nome e preço são obrigatórios' });
  }

  const newProduct = {
    id: 'p_' + Date.now(),
    name,
    description: description || '',
    price: Number(price),
    stock: Number(stock) || 0,
    image: image || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80',
    active: true,
    category: category || 'Tradicionais'
  };

  data.products.push(newProduct);

  data.stockHistory.unshift({
    id: 'hist_' + Date.now(),
    timestamp: new Date().toISOString(),
    type: 'ENTRY',
    productId: newProduct.id,
    productName: newProduct.name,
    quantityDelta: newProduct.stock,
    newStock: newProduct.stock,
    reason: 'Cadastro do produto com estoque inicial'
  });

  saveData(data);
  res.status(201).json(newProduct);
});

// 4. PUT Product (Update)
app.put('/api/products/:id', (req, res) => {
  const data = loadData();
  const index = data.products.findIndex(p => p.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Produto não encontrado' });
  }

  const oldProduct = data.products[index];
  const updatedProduct = {
    ...oldProduct,
    ...req.body,
    price: req.body.price !== undefined ? Number(req.body.price) : oldProduct.price,
    stock: req.body.stock !== undefined ? Number(req.body.stock) : oldProduct.stock
  };

  // If stock was directly changed via edit
  if (req.body.stock !== undefined && req.body.stock !== oldProduct.stock) {
    const delta = updatedProduct.stock - oldProduct.stock;
    data.stockHistory.unshift({
      id: 'hist_' + Date.now(),
      timestamp: new Date().toISOString(),
      type: delta > 0 ? 'ENTRY' : 'EXIT',
      productId: updatedProduct.id,
      productName: updatedProduct.name,
      quantityDelta: delta,
      newStock: updatedProduct.stock,
      reason: 'Ajuste manual de estoque via edição'
    });
  }

  data.products[index] = updatedProduct;
  saveData(data);
  res.json(updatedProduct);
});

// 5. PATCH Product Stock (+ / - quick buttons)
app.patch('/api/products/:id/stock', (req, res) => {
  const data = loadData();
  const product = data.products.find(p => p.id === req.params.id);

  if (!product) {
    return res.status(404).json({ error: 'Produto não encontrado' });
  }

  const { delta, reason } = req.body;
  const numDelta = Number(delta);

  if (isNaN(numDelta)) {
    return res.status(400).json({ error: 'Delta inválido' });
  }

  const newStock = Math.max(0, product.stock + numDelta);
  const actualDelta = newStock - product.stock;
  product.stock = newStock;

  data.stockHistory.unshift({
    id: 'hist_' + Date.now(),
    timestamp: new Date().toISOString(),
    type: actualDelta >= 0 ? 'ENTRY' : 'EXIT',
    productId: product.id,
    productName: product.name,
    quantityDelta: actualDelta,
    newStock: product.stock,
    reason: reason || (actualDelta > 0 ? 'Acréscimo manual (+)' : 'Redução manual (-)')
  });

  saveData(data);
  res.json(product);
});

// 6. DELETE Product
app.delete('/api/products/:id', (req, res) => {
  const data = loadData();
  const index = data.products.findIndex(p => p.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Produto não encontrado' });
  }

  const removed = data.products.splice(index, 1)[0];
  saveData(data);
  res.json({ success: true, removed });
});

// 7. GET Orders
app.get('/api/orders', (req, res) => {
  const data = loadData();
  // Return sorted descending by date
  const sorted = [...(data.orders || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(sorted);
});

// 8. POST Order (Create & Debit Stock)
app.post('/api/orders', (req, res) => {
  const data = loadData();
  const { customer, items, paymentMethod, notes, deliveryFee } = req.body;

  if (!items || !items.length) {
    return res.status(400).json({ error: 'O carrinho está vazio.' });
  }

  if (!customer || !customer.name || !customer.phone || !customer.street) {
    return res.status(400).json({ error: 'Preencha os dados obrigatórios do cliente.' });
  }

  // VALIDATION RULE: NUNCA permitir pedido maior que o estoque disponível
  for (const item of items) {
    const product = data.products.find(p => p.id === item.productId);
    if (!product) {
      return res.status(400).json({ error: `Sabor "${item.name}" não foi encontrado no cardápio.` });
    }
    if (product.stock < item.quantity) {
      return res.status(400).json({
        error: `Estoque insuficiente para "${product.name}". Disponível: ${product.stock}, Solicitado: ${item.quantity}.`
      });
    }
  }

  // DEBIT STOCK AUTOMATICALLY & RECORD AUDIT
  const now = new Date();
  const orderId = 'PED-' + Math.floor(1000 + Math.random() * 9000);

  items.forEach(item => {
    const product = data.products.find(p => p.id === item.productId);
    if (product) {
      product.stock -= item.quantity;

      data.stockHistory.unshift({
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
  const fee = Number(deliveryFee) || Number(data.settings.deliveryFee) || 0;
  const total = subtotal + fee;

  const newOrder = {
    id: orderId,
    createdAt: now.toISOString(),
    customer: {
      name: customer.name.trim(),
      phone: customer.phone.trim(),
      street: customer.street.trim(),
      number: customer.number ? customer.number.trim() : 'S/N',
      neighborhood: customer.neighborhood ? customer.neighborhood.trim() : '',
      complement: customer.complement ? customer.complement.trim() : '',
      reference: customer.reference ? customer.reference.trim() : ''
    },
    paymentMethod: paymentMethod || 'PIX',
    notes: notes ? notes.trim() : '',
    items,
    subtotal,
    deliveryFee: fee,
    total,
    status: 'Novo' // 'Novo', 'Em preparo', 'Enviado', 'Entregue', 'Cancelado'
  };

  data.orders.unshift(newOrder);
  saveData(data);

  res.status(201).json({ success: true, order: newOrder });
});

// 9. PATCH Order Status
app.patch('/api/orders/:id/status', (req, res) => {
  const data = loadData();
  const order = data.orders.find(o => o.id === req.params.id);

  if (!order) {
    return res.status(404).json({ error: 'Pedido não encontrado' });
  }

  const { status } = req.body;
  const oldStatus = order.status;

  if (!status) {
    return res.status(400).json({ error: 'Status é obrigatório' });
  }

  // BUSINESS RULE: Ao cancelar um pedido, DEVOLVER a quantidade ao estoque!
  if (status === 'Cancelado' && oldStatus !== 'Cancelado') {
    order.items.forEach(item => {
      const product = data.products.find(p => p.id === item.productId);
      if (product) {
        product.stock += item.quantity;

        data.stockHistory.unshift({
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

  order.status = status;
  saveData(data);

  res.json({ success: true, order });
});

// 10. GET Dashboard Stats
app.get('/api/dashboard', (req, res) => {
  const data = loadData();
  const now = new Date();

  // Start of today
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  // 7 days ago
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  // Start of this month
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const nonCancelledOrders = (data.orders || []).filter(o => o.status !== 'Cancelado');

  const salesToday = nonCancelledOrders
    .filter(o => new Date(o.createdAt) >= startOfToday)
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const salesWeek = nonCancelledOrders
    .filter(o => new Date(o.createdAt) >= sevenDaysAgo)
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const salesMonth = nonCancelledOrders
    .filter(o => new Date(o.createdAt) >= startOfMonth)
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const pendingOrders = (data.orders || []).filter(o => o.status === 'Novo' || o.status === 'Em preparo').length;

  const lowStockProducts = (data.products || []).filter(p => p.stock < 5);

  res.json({
    salesToday,
    salesWeek,
    salesMonth,
    pendingOrders,
    totalOrders: data.orders.length,
    lowStockCount: lowStockProducts.length,
    lowStockProducts
  });
});

// 11. GET Stock History
app.get('/api/stock-history', (req, res) => {
  const data = loadData();
  res.json(data.stockHistory || []);
});

// Serve frontend static build if it exists in production
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });
}

app.listen(PORT, () => {
  console.log(`🍰 Amor em Pote Backend rodando na porta ${PORT}`);
});
