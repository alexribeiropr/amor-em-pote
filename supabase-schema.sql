-- =========================================================================
-- ESQUEMA DO SUPABASE PARA AMOR EM POTE - DOCES ARTESANAIS 🍰
-- Execute este script no SQL Editor do seu projeto Supabase (supabase.com)
-- =========================================================================

-- 1. Tabela de Configurações da Loja
CREATE TABLE IF NOT EXISTS store_settings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  store_name TEXT DEFAULT 'Amor em Pote - Doces Artesanais',
  seller_phone TEXT DEFAULT '24999762118',
  admin_password TEXT DEFAULT 'admin123',
  pix_key TEXT DEFAULT 'contato@amorpote.com.br',
  delivery_fee NUMERIC DEFAULT 5.00,
  estimated_delivery_time TEXT DEFAULT '30 a 50 minutos',
  is_open BOOLEAN DEFAULT TRUE,
  business_hours TEXT DEFAULT 'Terça a Domingo: 13:00 às 21:00',
  closed_message TEXT DEFAULT 'Segunda-feira: Fechado para produção artesanal',
  categories JSONB DEFAULT '["Tradicionais", "Especiais", "Premium", "Frutas"]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir configuração padrão inicial se não existir
INSERT INTO store_settings (id) VALUES ('main') ON CONFLICT (id) DO NOTHING;

-- 2. Tabela de Produtos (Sabores de Bolos de Pote)
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price NUMERIC NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  image TEXT DEFAULT '',
  category TEXT DEFAULT 'Tradicionais',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir produtos iniciais caso a tabela esteja vazia
INSERT INTO products (id, name, description, price, stock, image, category, active) VALUES
('p1', 'Ninho com Nutella', 'Massa fofinha de chocolate, recheio cremoso de leite Ninho e pura Nutella original.', 14.50, 15, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80', 'Tradicionais', true),
('p2', 'Cenoura com Brigadeiro Belga', 'Bolo de cenoura caseiro ultra macio, coberto com generosas camadas de brigadeiro 50% cacau.', 13.00, 12, 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?auto=format&fit=crop&w=600&q=80', 'Tradicionais', true),
('p3', 'Morango com Brigadeiro Branco', 'Pedaços frescos de morango, creme branco aveludado e pão de ló amanteigado.', 15.00, 8, 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=600&q=80', 'Especiais', true),
('p4', 'Red Velvet com Cream Cheese', 'Massa aveludada vermelha com clássico recheio suave de cream cheese cítrico.', 16.00, 6, 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?auto=format&fit=crop&w=600&q=80', 'Premium', true),
('p5', 'Maracujá Cremoso com Chocolate', 'Equilíbrio perfeito do mousse de maracujá artesanal com ganache de chocolate meio amargo.', 14.00, 10, 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=600&q=80', 'Frutas', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Tabela de Pedidos
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  customer JSONB NOT NULL,
  items JSONB NOT NULL,
  payment_method TEXT DEFAULT 'PIX',
  notes TEXT DEFAULT '',
  subtotal NUMERIC NOT NULL DEFAULT 0,
  delivery_fee NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'Novo'
);

-- 4. Tabela de Histórico de Auditoria do Estoque
CREATE TABLE IF NOT EXISTS stock_history (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  type TEXT NOT NULL,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  quantity_delta INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  reason TEXT DEFAULT ''
);

-- 5. Habilitar Leitura e Escrita Pública (Anon / RLS)
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read store_settings" ON store_settings FOR ALL USING (true);
CREATE POLICY "Public Read/Write products" ON products FOR ALL USING (true);
CREATE POLICY "Public Read/Write orders" ON orders FOR ALL USING (true);
CREATE POLICY "Public Read/Write stock_history" ON stock_history FOR ALL USING (true);
