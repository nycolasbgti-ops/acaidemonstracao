-- ============================================================
-- AÇAÍ CONCEPT — Autenticação real do Admin (Supabase Auth)
-- Execute este arquivo no SQL Editor do Supabase.
-- ============================================================
-- Contexto: o Painel Admin (?admin) passou a falar DIRETO com o
-- Supabase pelo navegador (chave anon), sem passar mais pelo
-- backend Express. Sem isso, a chave anon sozinha permitiria
-- qualquer visitante escrever no cardápio/pedidos. Este arquivo
-- cria uma allowlist de administradores (admin_users) + policies
-- de RLS que só liberam escrita para quem estiver autenticado E
-- constar nessa allowlist.
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- 1) Allowlist de administradores
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_users (
  user_id     UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin reads own row" ON admin_users
  FOR SELECT USING (auth.uid() = user_id);


-- ────────────────────────────────────────────────────────────
-- 2) Função helper — true se o usuário autenticado é admin
--    (SECURITY DEFINER: ignora RLS da própria admin_users ao checar)
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid());
$$;


-- ────────────────────────────────────────────────────────────
-- 3) Categorias / Produtos / Adicionais — escrita restrita ao Admin
--    (leitura pública já existe em supabase-schema.sql)
-- ────────────────────────────────────────────────────────────
CREATE POLICY "Admin insert categories" ON categories FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin update categories" ON categories FOR UPDATE USING (is_admin());
CREATE POLICY "Admin delete categories" ON categories FOR DELETE USING (is_admin());

CREATE POLICY "Admin insert products" ON products FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin update products" ON products FOR UPDATE USING (is_admin());
CREATE POLICY "Admin delete products" ON products FOR DELETE USING (is_admin());

CREATE POLICY "Admin insert addons" ON addons FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin update addons" ON addons FOR UPDATE USING (is_admin());
CREATE POLICY "Admin delete addons" ON addons FOR DELETE USING (is_admin());


-- ────────────────────────────────────────────────────────────
-- 4) Pedidos — leitura e mudança de status restritas ao Admin
--    (a criação pública "Public insert orders" já existe)
-- ────────────────────────────────────────────────────────────
CREATE POLICY "Admin read orders"   ON orders FOR SELECT USING (is_admin());
CREATE POLICY "Admin update orders" ON orders FOR UPDATE USING (is_admin());


-- ────────────────────────────────────────────────────────────
-- 5) Configurações da loja (pix_key, whatsapp_number, banner_url)
--    — leitura e escrita restritas ao Admin
-- ────────────────────────────────────────────────────────────
CREATE POLICY "Admin read settings"   ON settings FOR SELECT USING (is_admin());
CREATE POLICY "Admin update settings" ON settings FOR UPDATE USING (is_admin());


-- ────────────────────────────────────────────────────────────
-- 6) Realtime — o dashboard de pedidos assina mudanças na tabela
--    Se der erro "already member of publication", ignore — já está ativo.
-- ────────────────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE orders;


-- ────────────────────────────────────────────────────────────
-- 7) Storage — bucket "product-images"
--    Crie o bucket manualmente no painel (Storage → New bucket →
--    marque como PÚBLICO) se ele ainda não existir.
-- ────────────────────────────────────────────────────────────
CREATE POLICY "Public read product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Admin upload product images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-images' AND is_admin());

CREATE POLICY "Admin update product images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'product-images' AND is_admin());

CREATE POLICY "Admin delete product images" ON storage.objects
  FOR DELETE USING (bucket_id = 'product-images' AND is_admin());


-- ============================================================
-- Como criar o primeiro administrador:
-- 1. Painel do Supabase → Authentication → Users → Add user
--    (defina um e-mail e senha — essas serão as credenciais de login do ?admin)
-- 2. Copie o UUID do usuário criado (coluna "User UID")
-- 3. Rode no SQL Editor:
--       INSERT INTO admin_users (user_id) VALUES ('<uuid-do-usuario>');
-- ============================================================
