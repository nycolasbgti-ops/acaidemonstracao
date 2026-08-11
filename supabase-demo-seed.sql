-- ============================================================
-- AÇAÍ CONCEPT — Script de Seed para Demonstração
-- Cardápio genérico completo para SaaS White Label
-- ============================================================
-- Como usar:
--   1. Acesse o painel do Supabase → Database → SQL Editor
--   2. Clique em "New query"
--   3. Cole este script inteiro e clique em "Run"
-- ============================================================

-- TRUNCATE das tabelas (cuidado em produção!)
-- TRUNCATE TABLE orders CASCADE;
-- TRUNCATE TABLE addons CASCADE;
-- TRUNCATE TABLE toppings CASCADE;
-- TRUNCATE TABLE products CASCADE;
-- TRUNCATE TABLE categories CASCADE;
-- TRUNCATE TABLE settings CASCADE;


-- ────────────────────────────────────────────────────────────
-- TABELA: settings (configurações da loja — apenas 1 linha)
-- ────────────────────────────────────────────────────────────
INSERT INTO settings (id, pix_key, whatsapp_number, store_name)
VALUES (1, '', '', 'Açaí Concept')
ON CONFLICT (id) DO UPDATE
SET store_name = 'Açaí Concept';


-- ────────────────────────────────────────────────────────────
-- SEED: CATEGORIAS
-- ────────────────────────────────────────────────────────────
INSERT INTO categories (name, slug, icon, order_position, is_builder, active) VALUES
  ('Açaís no Copo',      'copos-acai',       '🍧', 1, true,  true),
  ('Barcas de Açaí',     'barcas',           '🛶', 2, true,  true),
  ('Combos & Promoções', 'combos',           '🎁', 3, false, true),
  ('Picolés & Sorvetes', 'picoles-sorvetes', '🍭', 4, false, true),
  ('Milkshakes',         'milkshakes',       '🥛', 5, false, true),
  ('Bebidas',            'bebidas',          '🧃', 6, false, true),
  ('Lanches',            'lanches',          '🥐', 7, false, true)
ON CONFLICT (slug) DO NOTHING;


-- ────────────────────────────────────────────────────────────
-- SEED: ACOMPANHAMENTOS GRÁTIS (Toppings Base)
-- ────────────────────────────────────────────────────────────
INSERT INTO toppings (key, name, price, order_position, active) VALUES
  ('leite-ninho',            'Leite Ninho',            0.00, 1,  true),
  ('pacoca',                 'Paçoca',                 0.00, 2,  true),
  ('morango',                'Morango Fresco',        0.00, 3,  true),
  ('banana',                 'Banana',                0.00, 4,  true),
  ('granola',                'Granola Crocante',      0.00, 5,  true),
  ('leite-condensado',       'Leite Condensado',      0.00, 6,  true),
  ('amendoim',               'Amendoim Torrado',      0.00, 7,  true),
  ('mel',                    'Mel Puro',              0.00, 8,  true),
  ('coco',                   'Coco Ralado',           0.00, 9,  true),
  ('confete',                'Confete de Chocolate',  0.00, 10, true),
  ('morango-desidratado',    'Morango Desidratado',   0.00, 11, true),
  ('blueberry',              'Blueberry',             0.00, 12, true)
ON CONFLICT (key) DO NOTHING;

-- Extras pagos
INSERT INTO toppings (key, name, price, order_position, active) VALUES
  ('nutella',              'Nutella',                4.50, 13, true),
  ('pistache',             'Creme de Pistache',      5.50, 14, true),
  ('chocoball',            'Chocoball',              2.50, 15, true),
  ('bis',                  'Bis Triturado',          2.00, 16, true),
  ('chocolate-belga',      'Chocolate Belga 60%',    6.00, 17, true),
  ('calda-caramelo',       'Calda de Caramelo',      3.00, 18, true),
  ('calda-chocolate',      'Calda de Chocolate',     3.00, 19, true)
ON CONFLICT (key) DO NOTHING;


-- ────────────────────────────────────────────────────────────
-- SEED: PRODUTOS - AÇAÍS NO COPO
-- ────────────────────────────────────────────────────────────
INSERT INTO products (category_id, name, description, prices, free_toppings, emoji, image_url, active, order_position)
VALUES
  ((SELECT id FROM categories WHERE slug = 'copos-acai'), 'Kids 200ml', 
   'Para os pequenos. Até 2 acompanhamentos grátis.',
   '{"unique": 16.00}', 2, '🍧', 
   'https://images.unsplash.com/photo-1590080876003-fe60b0b0e93f?w=500&h=500&fit=crop', true, 1),
   
  ((SELECT id FROM categories WHERE slug = 'copos-acai'), 'Pequeno 300ml',
   'Perfeito para um lanche. Até 4 acompanhamentos grátis.',
   '{"unique": 24.00}', 4, '🍧',
   'https://images.unsplash.com/photo-1590079225686-f2b2a97c9e97?w=500&h=500&fit=crop', true, 2),
   
  ((SELECT id FROM categories WHERE slug = 'copos-acai'), 'Médio 400ml',
   'O tamanho ideal. Até 6 acompanhamentos grátis.',
   '{"unique": 32.00}', 6, '🍧',
   'https://images.unsplash.com/photo-1590080875543-3c0f0c50b8f4?w=500&h=500&fit=crop', true, 3),
   
  ((SELECT id FROM categories WHERE slug = 'copos-acai'), 'Grande 500ml',
   'Para quem ama açaí. Até 8 acompanhamentos grátis.',
   '{"unique": 39.00}', 8, '🍧',
   'https://images.unsplash.com/photo-1590080875449-1f0c7a8c0e35?w=500&h=500&fit=crop', true, 4),
   
  ((SELECT id FROM categories WHERE slug = 'copos-acai'), 'Super Premium 700ml',
   'O maior! Acompanhamentos à vontade. Experiência total.',
   '{"unique": 48.00}', -1, '🍧',
   'https://images.unsplash.com/photo-1590080876518-b8b8d1b0c95f?w=500&h=500&fit=crop', true, 5)
ON CONFLICT DO NOTHING;


-- ────────────────────────────────────────────────────────────
-- SEED: PRODUTOS - BARCAS DE AÇAÍ
-- ────────────────────────────────────────────────────────────
INSERT INTO products (category_id, name, description, prices, free_toppings, emoji, image_url, active, order_position)
VALUES
  ((SELECT id FROM categories WHERE slug = 'barcas'), 'Barca Pequena',
   'Barca apresentação. Até 5 acompanhamentos grátis.',
   '{"unique": 38.00}', 5, '🛶',
   'https://images.unsplash.com/photo-1590080876703-3a79d7ce8e88?w=500&h=500&fit=crop', true, 1),
   
  ((SELECT id FROM categories WHERE slug = 'barcas'), 'Barca Média',
   'Barca clássica. Até 7 acompanhamentos grátis.',
   '{"unique": 54.00}', 7, '🛶',
   'https://images.unsplash.com/photo-1590080876800-8ebed4f6da75?w=500&h=500&fit=crop', true, 2),
   
  ((SELECT id FROM categories WHERE slug = 'barcas'), 'Barca Grande',
   'Barca para compartilhar. Acompanhamentos à vontade.',
   '{"unique": 72.00}', -1, '🛶',
   'https://images.unsplash.com/photo-1590080876894-5b7c4c8c1b42?w=500&h=500&fit=crop', true, 3),
   
  ((SELECT id FROM categories WHERE slug = 'barcas'), 'Barca Executiva',
   'Luxo em formato barca. Muitos acompanhamentos grátis.',
   '{"unique": 65.00}', 10, '🛶',
   'https://images.unsplash.com/photo-1590080876510-96bb4b7c0e51?w=500&h=500&fit=crop', true, 4)
ON CONFLICT DO NOTHING;


-- ────────────────────────────────────────────────────────────
-- SEED: PRODUTOS - COMBOS & PROMOÇÕES
-- ────────────────────────────────────────────────────────────
INSERT INTO products (category_id, name, description, prices, free_toppings, emoji, image_url, active, order_position)
VALUES
  ((SELECT id FROM categories WHERE slug = 'combos'), 'Combo Casal',
   '2x Açaís Médios (400ml) com acompanhamentos à escolha.',
   '{"unique": 59.00}', 0, '💑',
   'https://images.unsplash.com/photo-1590080875542-3c0f0c50b8f5?w=500&h=500&fit=crop', true, 1),
   
  ((SELECT id FROM categories WHERE slug = 'combos'), 'Combo Família',
   '1 Barca Grande + 4 picolés da casa. Perfeito para reuniões.',
   '{"unique": 89.00}', 0, '👨‍👩‍👧‍👦',
   'https://images.unsplash.com/photo-1590080875541-2c0f0c50b8f5?w=500&h=500&fit=crop', true, 2),
   
  ((SELECT id FROM categories WHERE slug = 'combos'), 'Combo Amigos',
   '3x Açaís Grandes + 3 milkshakes à escolha.',
   '{"unique": 109.00}', 0, '👯',
   'https://images.unsplash.com/photo-1590080875540-5c0f0c50b8f5?w=500&h=500&fit=crop', true, 3),
   
  ((SELECT id FROM categories WHERE slug = 'combos'), 'Combo Festa (12 pç)',
   'Seleção festiva: 2 Barcas Grandes + 12 Picolés variados.',
   '{"unique": 179.00}', 0, '🎉',
   'https://images.unsplash.com/photo-1590080875539-3c0f0c50b8f5?w=500&h=500&fit=crop', true, 4)
ON CONFLICT DO NOTHING;


-- ────────────────────────────────────────────────────────────
-- SEED: PRODUTOS - PICOLÉS & SORVETES
-- ────────────────────────────────────────────────────────────
INSERT INTO products (category_id, name, description, prices, free_toppings, emoji, image_url, active, order_position)
VALUES
  ((SELECT id FROM categories WHERE slug = 'picoles-sorvetes'), 'Picolé de Açaí',
   'Picolé artesanal de açaí 100% puro. Refrescante.',
   '{"unique": 8.50}', 0, '🍭',
   'https://images.unsplash.com/photo-1605350897765-4cf30eb7cfcd?w=500&h=500&fit=crop', true, 1),
   
  ((SELECT id FROM categories WHERE slug = 'picoles-sorvetes'), 'Picolé de Morango',
   'Cremoso e suave sabor morango natural.',
   '{"unique": 8.00}', 0, '🍭',
   'https://images.unsplash.com/photo-1605350897764-4cf30eb7cfcd?w=500&h=500&fit=crop', true, 2),
   
  ((SELECT id FROM categories WHERE slug = 'picoles-sorvetes'), 'Picolé de Maracujá',
   'Refrescante e tropical com toque azedo perfeito.',
   '{"unique": 8.00}', 0, '🍭',
   'https://images.unsplash.com/photo-1605350897763-4cf30eb7cfcd?w=500&h=500&fit=crop', true, 3),
   
  ((SELECT id FROM categories WHERE slug = 'picoles-sorvetes'), 'Picolé de Chocolate',
   'Chocolate belga envolvendo picolé de cream.',
   '{"unique": 9.50}', 0, '🍭',
   'https://images.unsplash.com/photo-1605350897762-4cf30eb7cfcd?w=500&h=500&fit=crop', true, 4),
   
  ((SELECT id FROM categories WHERE slug = 'picoles-sorvetes'), 'Sorvete no Pote 300ml',
   'Sorvete premium em pote. Escolha 2 sabores diferentes.',
   '{"unique": 18.00}', 0, '🍦',
   'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500&h=500&fit=crop', true, 5),
   
  ((SELECT id FROM categories WHERE slug = 'picoles-sorvetes'), 'Sorvete no Pote 500ml',
   'Sorvete premium grande. Escolha 3 sabores diferentes.',
   '{"unique": 26.00}', 0, '🍦',
   'https://images.unsplash.com/photo-1563805042-7684c019e1cd?w=500&h=500&fit=crop', true, 6)
ON CONFLICT DO NOTHING;


-- ────────────────────────────────────────────────────────────
-- SEED: PRODUTOS - MILKSHAKES
-- ────────────────────────────────────────────────────────────
INSERT INTO products (category_id, name, description, prices, free_toppings, emoji, image_url, active, order_position)
VALUES
  ((SELECT id FROM categories WHERE slug = 'milkshakes'), 'Milkshake de Açaí',
   'Cremoso milk shake de açaí fresco. 400ml.',
   '{"unique": 22.00}', 0, '🥛',
   'https://images.unsplash.com/photo-1590080875513-6c0f0c50b8f5?w=500&h=500&fit=crop', true, 1),
   
  ((SELECT id FROM categories WHERE slug = 'milkshakes'), 'Milkshake de Morango',
   'Refrescante com morango natural e sorvete. 400ml.',
   '{"unique": 20.00}', 0, '🥛',
   'https://images.unsplash.com/photo-1590080875512-6c0f0c50b8f5?w=500&h=500&fit=crop', true, 2),
   
  ((SELECT id FROM categories WHERE slug = 'milkshakes'), 'Milkshake de Chocolate',
   'Cremoso de chocolate belga com leite integral. 400ml.',
   '{"unique": 20.00}', 0, '🥛',
   'https://images.unsplash.com/photo-1590080875511-6c0f0c50b8f5?w=500&h=500&fit=crop', true, 3),
   
  ((SELECT id FROM categories WHERE slug = 'milkshakes'), 'Milkshake de Banana',
   'Clássico com banana e toque de canela. 400ml.',
   '{"unique": 18.00}', 0, '🥛',
   'https://images.unsplash.com/photo-1590080875510-6c0f0c50b8f5?w=500&h=500&fit=crop', true, 4),
   
  ((SELECT id FROM categories WHERE slug = 'milkshakes'), 'Milkshake Misto',
   'Combinação de morango, banana e chocolate. 500ml.',
   '{"unique": 25.00}', 0, '🥛',
   'https://images.unsplash.com/photo-1590080875509-6c0f0c50b8f5?w=500&h=500&fit=crop', true, 5)
ON CONFLICT DO NOTHING;


-- ────────────────────────────────────────────────────────────
-- SEED: PRODUTOS - BEBIDAS
-- ────────────────────────────────────────────────────────────
INSERT INTO products (category_id, name, description, prices, free_toppings, emoji, image_url, active, order_position)
VALUES
  ((SELECT id FROM categories WHERE slug = 'bebidas'), 'Água Mineral 500ml',
   'Água mineral com ou sem gás.',
   '{"unique": 5.00}', 0, '💧',
   'https://images.unsplash.com/photo-1602088113235-229c19758e9f?w=500&h=500&fit=crop', true, 1),
   
  ((SELECT id FROM categories WHERE slug = 'bebidas'), 'Suco Natural 300ml',
   'Laranja, limão ou maracujá. Fresco do dia.',
   '{"unique": 10.00}', 0, '🍊',
   'https://images.unsplash.com/photo-1599599810694-b5ac4dd01e3e?w=500&h=500&fit=crop', true, 2),
   
  ((SELECT id FROM categories WHERE slug = 'bebidas'), 'Refrigerante 350ml',
   'Coca-Cola, Sprite ou Guaraná gelado.',
   '{"unique": 6.50}', 0, '🥤',
   'https://images.unsplash.com/photo-1554866585-d34d2c3aee6c?w=500&h=500&fit=crop', true, 3),
   
  ((SELECT id FROM categories WHERE slug = 'bebidas'), 'Energético 250ml',
   'Energy drink premium para mais energia.',
   '{"unique": 12.00}', 0, '⚡',
   'https://images.unsplash.com/photo-1599599810724-8249cba80f80?w=500&h=500&fit=crop', true, 4),
   
  ((SELECT id FROM categories WHERE slug = 'bebidas'), 'Chá Gelado 400ml',
   'Chá gelado de frutas vermelhas. Refrescante.',
   '{"unique": 8.00}', 0, '🫖',
   'https://images.unsplash.com/photo-1599599810724-8249cba80f81?w=500&h=500&fit=crop', true, 5),

  ((SELECT id FROM categories WHERE slug = 'bebidas'), 'Coca-Cola Lata 350ml',
   'Coca-Cola gelada, lata 350ml.',
   '{"unique": 6.50}', 0, '🥤',
   'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&h=500&fit=crop', true, 6),

  ((SELECT id FROM categories WHERE slug = 'bebidas'), 'Guaraná Lata 350ml',
   'Guaraná Antarctica gelado, lata 350ml.',
   '{"unique": 6.50}', 0, '🥤',
   'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&h=500&fit=crop', true, 7),

  ((SELECT id FROM categories WHERE slug = 'bebidas'), 'Água sem Gás 500ml',
   'Água mineral natural sem gás.',
   '{"unique": 4.00}', 0, '💧',
   'https://images.unsplash.com/photo-1602088113235-229c19758e9f?w=500&h=500&fit=crop', true, 8),

  ((SELECT id FROM categories WHERE slug = 'bebidas'), 'Água com Gás 500ml',
   'Água mineral gaseificada bem gelada.',
   '{"unique": 4.50}', 0, '🫧',
   'https://images.unsplash.com/photo-1602088113235-229c19758e9f?w=500&h=500&fit=crop', true, 9),

  ((SELECT id FROM categories WHERE slug = 'bebidas'), 'Suco Natural de Uva 300ml',
   'Suco natural de uva, feito na hora.',
   '{"unique": 10.00}', 0, '🍇',
   'https://images.unsplash.com/photo-1599599810694-b5ac4dd01e3e?w=500&h=500&fit=crop', true, 10)
ON CONFLICT DO NOTHING;


-- ────────────────────────────────────────────────────────────
-- SEED: PRODUTOS - LANCHES
-- ────────────────────────────────────────────────────────────
INSERT INTO products (category_id, name, description, prices, free_toppings, emoji, image_url, active, order_position)
VALUES
  ((SELECT id FROM categories WHERE slug = 'lanches'), 'Croissant Amanteigado',
   'Croissant fresco, amanteigado e crocante.',
   '{"unique": 8.50}', 0, '🥐',
   'https://images.unsplash.com/photo-1527521060660-15cd12a73e0e?w=500&h=500&fit=crop', true, 1),
   
  ((SELECT id FROM categories WHERE slug = 'lanches'), 'Muffin de Chocolate',
   'Muffin com gotas de chocolate belga.',
   '{"unique": 9.00}', 0, '🧁',
   'https://images.unsplash.com/photo-1609779871055-72a50e5eaa8e?w=500&h=500&fit=crop', true, 2),
   
  ((SELECT id FROM categories WHERE slug = 'lanches'), 'Brownie Premium',
   'Brownie denso e delicioso de chocolate.',
   '{"unique": 10.00}', 0, '🍫',
   'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=500&h=500&fit=crop', true, 3),
   
  ((SELECT id FROM categories WHERE slug = 'lanches'), 'Cookie de Chocolate',
   'Cookie crocante com gotas de chocolate.',
   '{"unique": 6.50}', 0, '🍪',
   'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=500&h=500&fit=crop', true, 4),
   
  ((SELECT id FROM categories WHERE slug = 'lanches'), 'Fatia de Bolo',
   'Bolo do dia conforme disponibilidade.',
   '{"unique": 11.00}', 0, '🍰',
   'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&h=500&fit=crop', true, 5)
ON CONFLICT DO NOTHING;


-- ────────────────────────────────────────────────────────────
-- SEED: ADDONS (Massas, Caldas, Acompanhamentos, Extras)
-- ────────────────────────────────────────────────────────────

-- Massas
INSERT INTO addons (category, name, price, order_position, active) VALUES
  ('massa', 'Açaí Tradicional',    0.00, 1, true),
  ('massa', 'Sorvete de Morango',  0.00, 2, true),
  ('massa', 'Casadinho',           0.00, 3, true),
  ('massa', 'Açaí com Cupuaçu',   0.00, 4, true),
  ('massa', 'Açaí Chocolate',      0.00, 5, true),
  ('massa', 'Banana com Açaí',     0.00, 6, true)
ON CONFLICT DO NOTHING;

-- Caldas
INSERT INTO addons (category, name, price, order_position, active) VALUES
  ('calda', 'Leite Condensado',    0.00, 1, true),
  ('calda', 'Mel',                 0.00, 2, true),
  ('calda', 'Calda de Chocolate',  0.00, 3, true),
  ('calda', 'Calda de Morango',    0.00, 4, true),
  ('calda', 'Calda de Caramelo',   0.00, 5, true)
ON CONFLICT DO NOTHING;

-- Acompanhamentos
INSERT INTO addons (category, name, price, order_position, active) VALUES
  ('acompanhamento', 'Leite Ninho',           0.00,  1, true),
  ('acompanhamento', 'Paçoca',                0.00,  2, true),
  ('acompanhamento', 'Morango Fresco',        0.00,  3, true),
  ('acompanhamento', 'Banana',                0.00,  4, true),
  ('acompanhamento', 'Granola Crocante',      0.00,  5, true),
  ('acompanhamento', 'Leite Condensado',      0.00,  6, true),
  ('acompanhamento', 'Amendoim Torrado',      0.00,  7, true),
  ('acompanhamento', 'Mel Puro',              0.00,  8, true),
  ('acompanhamento', 'Coco Ralado',           0.00,  9, true),
  ('acompanhamento', 'Confete de Chocolate',  0.00, 10, true),
  ('acompanhamento', 'Morango Desidratado',   0.00, 11, true),
  ('acompanhamento', 'Blueberry',             0.00, 12, true)
ON CONFLICT DO NOTHING;

-- Extras Pagos
INSERT INTO addons (category, name, price, order_position, active) VALUES
  ('extra', 'Nutella',               4.50, 1, true),
  ('extra', 'Creme de Pistache',     5.50, 2, true),
  ('extra', 'Chocoball',             2.50, 3, true),
  ('extra', 'Bis Triturado',         2.00, 4, true),
  ('extra', 'Chocolate Belga 60%',   6.00, 5, true),
  ('extra', 'Calda de Caramelo',     3.00, 6, true),
  ('extra', 'Calda de Chocolate',    3.00, 7, true)
ON CONFLICT DO NOTHING;


-- ────────────────────────────────────────────────────────────
-- FIM DO SCRIPT
-- ────────────────────────────────────────────────────────────
-- Script concluído! O banco agora contém um cardápio genérico
-- completo e pronto para ser customizado por cada tenant.
-- ────────────────────────────────────────────────────────────
