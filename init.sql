-- ============================================================
-- AÇAÍ CONCEPT — Inicialização do Banco de Dados
-- Executado automaticamente pelo Docker na primeira subida.
-- NOTA: Este arquivo é genérico para QUALQUER implementação
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- TABELA: settings
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS settings (
  id               SMALLINT  PRIMARY KEY DEFAULT 1,
  pix_key          TEXT      NOT NULL DEFAULT '',
  whatsapp_number  TEXT      NOT NULL DEFAULT '',
  banner_url       TEXT,
  CONSTRAINT settings_single_row CHECK (id = 1)
);

INSERT INTO settings (id, pix_key, whatsapp_number, banner_url)
VALUES (1, '', '', NULL)
ON CONFLICT (id) DO NOTHING;


-- ────────────────────────────────────────────────────────────
-- TABELA: categories
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
-- TABELA: products
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
-- TABELA: orders
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
-- SEED: categorias genéricas iniciais
-- ────────────────────────────────────────────────────────────
INSERT INTO categories (name, slug, icon, order_position, is_builder, active) VALUES
  ('Açaís no Copo',      'copos-acai',       '🍧', 1, true,  true),
  ('Bebidas',            'bebidas',          '🧃', 2, false, true),
  ('Lanches',            'lanches',          '🥐', 3, false, true)
ON CONFLICT (slug) DO NOTHING;
