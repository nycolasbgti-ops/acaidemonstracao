-- ============================================================
-- AÇAÍ CONCEPT — Acesso público total (bypass de RLS via anon)
-- Execute este arquivo no SQL Editor do Supabase.
-- ============================================================
-- Contexto: o login do Admin voltou a ser um PIN validado só no
-- frontend (sem Supabase Auth). Como não existe mais uma sessão
-- autenticada, as policies baseadas em is_admin()/admin_users
-- nunca vão liberar nada — então este arquivo troca todas as
-- policies de escrita por policies públicas (USING true /
-- WITH CHECK true), liberando categories, products, addons,
-- orders, settings e o bucket de imagens para a role anon.
--
-- ATENÇÃO: qualquer pessoa que inspecione o app e copie a chave
-- anon (ela É pública, vai no bundle do frontend) passa a poder
-- ler e ESCREVER livremente nessas tabelas, sem precisar do PIN.
-- O PIN só protege a UI do painel — não protege o banco.
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- 1) Remove as policies antigas baseadas em autenticação
--    (is_admin() nunca mais vai ser satisfeito sem Supabase Auth)
-- ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Admin insert categories" ON categories;
DROP POLICY IF EXISTS "Admin update categories" ON categories;
DROP POLICY IF EXISTS "Admin delete categories" ON categories;

DROP POLICY IF EXISTS "Admin insert products" ON products;
DROP POLICY IF EXISTS "Admin update products" ON products;
DROP POLICY IF EXISTS "Admin delete products" ON products;

DROP POLICY IF EXISTS "Admin insert addons" ON addons;
DROP POLICY IF EXISTS "Admin update addons" ON addons;
DROP POLICY IF EXISTS "Admin delete addons" ON addons;

DROP POLICY IF EXISTS "Admin read orders"   ON orders;
DROP POLICY IF EXISTS "Admin update orders" ON orders;

DROP POLICY IF EXISTS "Admin read settings"   ON settings;
DROP POLICY IF EXISTS "Admin update settings" ON settings;

DROP POLICY IF EXISTS "Admin upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin update product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete product images" ON storage.objects;
-- "Public read product images" já é pública, não precisa remover.


-- ────────────────────────────────────────────────────────────
-- 2) Categorias / Produtos / Adicionais — escrita pública total
--    (a leitura pública já existe em supabase-schema.sql)
-- ────────────────────────────────────────────────────────────
CREATE POLICY "Public write categories" ON categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Public edit categories"  ON categories FOR UPDATE USING (true);
CREATE POLICY "Public delete categories" ON categories FOR DELETE USING (true);

CREATE POLICY "Public write products" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Public edit products"  ON products FOR UPDATE USING (true);
CREATE POLICY "Public delete products" ON products FOR DELETE USING (true);

CREATE POLICY "Public write addons" ON addons FOR INSERT WITH CHECK (true);
CREATE POLICY "Public edit addons"  ON addons FOR UPDATE USING (true);
CREATE POLICY "Public delete addons" ON addons FOR DELETE USING (true);


-- ────────────────────────────────────────────────────────────
-- 3) Pedidos — leitura pública (dashboard admin + busca por
--    telefone do cliente) e atualização de status pública
--    (a criação pública "Public insert orders" já existe)
-- ────────────────────────────────────────────────────────────
CREATE POLICY "Public read orders"   ON orders FOR SELECT USING (true);
CREATE POLICY "Public update orders" ON orders FOR UPDATE USING (true);


-- ────────────────────────────────────────────────────────────
-- 4) Configurações da loja (pix_key, whatsapp_number, banner_url)
--    — leitura e escrita públicas
-- ────────────────────────────────────────────────────────────
CREATE POLICY "Public read settings"   ON settings FOR SELECT USING (true);
CREATE POLICY "Public update settings" ON settings FOR UPDATE USING (true);


-- ────────────────────────────────────────────────────────────
-- 5) Storage — bucket "product-images": upload/edição/exclusão
--    públicos (leitura pública já existe)
-- ────────────────────────────────────────────────────────────
CREATE POLICY "Public upload product images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Public edit product images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'product-images');

CREATE POLICY "Public delete product images" ON storage.objects
  FOR DELETE USING (bucket_id = 'product-images');


-- ============================================================
-- Limpeza opcional (não obrigatória — is_admin()/admin_users
-- ficam apenas inofensivos e sem uso depois deste arquivo):
--
--   DROP FUNCTION IF EXISTS is_admin();
--   DROP TABLE IF EXISTS admin_users;
--
-- Só rode isso se tiver certeza de que não vai voltar a usar
-- Supabase Auth para o Admin.
-- ============================================================
