-- ============================================================
-- AÇAÍ CONCEPT — Schema para Supabase (Genérico/White Label)
-- ============================================================
-- Este arquivo define apenas as ESTRUTURAS DE TABELAS
-- Os dados de seed estão em: supabase-demo-seed.sql
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- TABELA: settings (configurações da loja — apenas 1 linha)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS settings (
  id               SMALLINT  PRIMARY KEY DEFAULT 1,
  pix_key          TEXT      NOT NULL DEFAULT '',
  whatsapp_number  TEXT      NOT NULL DEFAULT '',
  store_name       TEXT      NOT NULL DEFAULT 'Açaí Concept',
  CONSTRAINT settings_single_row CHECK (id = 1)
);

INSERT INTO settings (id, pix_key, whatsapp_number, store_name)
VALUES (1, '', '', 'Açaí Concept')
ON CONFLICT (id) DO NOTHING;


-- ────────────────────────────────────────────────────────────
-- TABELA: categories (categorias do cardápio)
-- ────────────────────────────────────────────────────────────
-- is_builder = true  → abre modal de montagem interativa
-- is_builder = false → produto simples, preço fixo
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  name            TEXT        NOT NULL,
  slug            TEXT        NOT NULL UNIQUE,
  icon            TEXT        NOT NULL DEFAULT '🍧',
  order_position  SMALLINT    NOT NULL DEFAULT 0,
  is_builder      BOOLEAN     NOT NULL DEFAULT false,
  active          BOOLEAN     NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_categories_order  ON categories(order_position);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(active);


-- ────────────────────────────────────────────────────────────
-- TABELA: products (produtos do cardápio)
-- ────────────────────────────────────────────────────────────
-- prices (JSONB):
--   Preço único:    { "unique": 21.00 }
--   Por tamanho:    { "P": 30.00, "M": 40.00, "G": 50.00 }
--
-- free_toppings:
--    0  → produto simples, sem builder
--   >0  → qtd máxima de acompanhamentos grátis
--   -1  → acompanhamentos ilimitados
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  category_id     UUID        NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name            TEXT        NOT NULL,
  description     TEXT,
  prices          JSONB       NOT NULL DEFAULT '{"unique": 0}',
  free_toppings   SMALLINT    NOT NULL DEFAULT 0,
  emoji           TEXT,
  image_url       TEXT,
  active          BOOLEAN     NOT NULL DEFAULT true,
  order_position  SMALLINT    NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_order    ON products(order_position);
CREATE INDEX IF NOT EXISTS idx_products_active   ON products(active);


-- ────────────────────────────────────────────────────────────
-- TABELA: toppings (acompanhamentos grátis + extras pagos)
-- ────────────────────────────────────────────────────────────
-- price = 0.00  → acompanhamento grátis
-- price > 0.00  → extra pago
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS toppings (
  id              UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at      TIMESTAMPTZ   DEFAULT NOW() NOT NULL,
  key             TEXT          NOT NULL UNIQUE,
  name            TEXT          NOT NULL,
  price           DECIMAL(10,2) NOT NULL DEFAULT 0,
  active          BOOLEAN       NOT NULL DEFAULT true,
  order_position  SMALLINT      NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_toppings_active ON toppings(active);


-- ────────────────────────────────────────────────────────────
-- TABELA: addons (Massas, Caldas, Acompanhamentos, Extras)
-- ────────────────────────────────────────────────────────────
-- category: 'massa' | 'calda' | 'acompanhamento' | 'extra'
-- price = 0.00  → grátis
-- price > 0.00  → pago
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS addons (
  id              UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at      TIMESTAMPTZ   DEFAULT NOW() NOT NULL,
  category        TEXT          NOT NULL
                                CHECK (category IN ('massa', 'calda', 'acompanhamento', 'extra')),
  name            TEXT          NOT NULL,
  price           DECIMAL(10,2) NOT NULL DEFAULT 0,
  active          BOOLEAN       NOT NULL DEFAULT true,
  order_position  SMALLINT      NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_addons_category ON addons(category);
CREATE INDEX IF NOT EXISTS idx_addons_active   ON addons(active);


-- ────────────────────────────────────────────────────────────
-- TABELA: orders (pedidos)
-- ────────────────────────────────────────────────────────────
-- items (JSONB) — estrutura de cada item do pedido:
-- [
--   {
--     "id": "acai-300ml",
--     "name": "Copo 300ml",
--     "qty": 1,
--     "price": 24.00,
--     "base": "tradicional",
--     "toppings": ["leite-ninho", "granola"],
--     "extras": [{ "key": "nutella", "label": "Nutella", "price": 4.50 }]
--   }
-- ]
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id              UUID           DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at      TIMESTAMPTZ    DEFAULT NOW() NOT NULL,
  customer_name   TEXT           NOT NULL,
  customer_phone  TEXT           NOT NULL,
  delivery_type   TEXT           NOT NULL CHECK (delivery_type IN ('delivery', 'pickup')),
  address         TEXT,
  payment_method  TEXT           NOT NULL CHECK (payment_method IN ('pix', 'credit', 'debit', 'cash')),
  change_for      TEXT,
  items           JSONB          NOT NULL DEFAULT '[]',
  total           DECIMAL(10,2)  NOT NULL,
  status          TEXT           NOT NULL DEFAULT 'new'
                                 CHECK (status IN ('new', 'preparing', 'delivering', 'delivered')),
  notes           TEXT
);

CREATE INDEX IF NOT EXISTS idx_orders_status     ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);


-- ────────────────────────────────────────────────────────────
-- RLS — Row Level Security (Políticas de Segurança)
-- ────────────────────────────────────────────────────────────
ALTER TABLE settings   ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products   ENABLE ROW LEVEL SECURITY;
ALTER TABLE toppings   ENABLE ROW LEVEL SECURITY;
ALTER TABLE addons     ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders     ENABLE ROW LEVEL SECURITY;

-- Leitura pública: qualquer pessoa pode ver o cardápio
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read products"   ON products   FOR SELECT USING (true);
CREATE POLICY "Public read toppings"   ON toppings   FOR SELECT USING (true);
CREATE POLICY "Public read addons"     ON addons     FOR SELECT USING (true);

-- Clientes podem criar pedidos
CREATE POLICY "Public insert orders"   ON orders     FOR INSERT WITH CHECK (true);

-- Nota: a SERVICE_ROLE_KEY (usada no backend) ignora RLS automaticamente.
-- As policies acima protegem o caso de acesso direto com ANON_KEY.


-- ────────────────────────────────────────────────────────────
-- FIM DO SCHEMA
-- ────────────────────────────────────────────────────────────
-- Para popular o banco com dados de demonstração,
-- execute o arquivo: supabase-demo-seed.sql
-- ────────────────────────────────────────────────────────────
