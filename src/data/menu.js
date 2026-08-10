// ────────────────────────────────────────────────────────────────────────
// BASES/MASSAS - Passo 1 do Builder de Açaí
// ────────────────────────────────────────────────────────────────────────
export const ACAI_BASES = [
  { key: 'tradicional',     label: 'Açaí Tradicional',    description: 'Puro açaí cremoso da Amazônia, sabor autêntico' },
  { key: 'morango',         label: 'Sorvete de Morango',  description: 'Cremoso e refrescante com toque de morango' },
  { key: 'casadinho',       label: 'Casadinho',           description: 'Açaí + Creme de baunilha - a dupla perfeita' },
  { key: 'cupuacu',         label: 'Açaí com Cupuaçu',    description: 'Combinação amazônica irresistível' },
  { key: 'chocolate',       label: 'Açaí Chocolate',      description: 'Açaí misturado com chocolate belga' },
  { key: 'banana',          label: 'Banana com Açaí',     description: 'Cremoso toque tropical' },
]

// ────────────────────────────────────────────────────────────────────────
// ACOMPANHAMENTOS GRÁTIS - Passo 2 do Builder
// ────────────────────────────────────────────────────────────────────────
export const ACAI_TOPPINGS = [
  { key: 'leite-ninho',      label: 'Leite Ninho' },
  { key: 'pacoca',           label: 'Paçoca' },
  { key: 'morango',          label: 'Morango Fresco' },
  { key: 'banana',           label: 'Banana' },
  { key: 'granola',          label: 'Granola Crocante' },
  { key: 'leite-condensado', label: 'Leite Condensado' },
  { key: 'amendoim',         label: 'Amendoim Torrado' },
  { key: 'mel',              label: 'Mel Puro' },
  { key: 'coco',             label: 'Coco Ralado' },
  { key: 'confete',          label: 'Confete de Chocolate' },
  { key: 'morango-desidratado', label: 'Morango Desidratado' },
  { key: 'blueberry',        label: 'Blueberry' },
]

// ────────────────────────────────────────────────────────────────────────
// ADICIONAIS PAGOS - Passo 3 do Builder
// ────────────────────────────────────────────────────────────────────────
export const ACAI_EXTRAS = [
  { key: 'nutella',         label: 'Nutella',               price: 4.50 },
  { key: 'pistache',        label: 'Creme de Pistache',     price: 5.50 },
  { key: 'chocoball',       label: 'Chocoball',             price: 2.50 },
  { key: 'bis',             label: 'Bis Triturado',         price: 2.00 },
  { key: 'chocolate-belga', label: 'Chocolate Belga 60%',   price: 6.00 },
  { key: 'calda-caramelo',  label: 'Calda de Caramelo',     price: 3.00 },
  { key: 'calda-chocolate', label: 'Calda de Chocolate',    price: 3.00 },
]

// ────────────────────────────────────────────────────────────────────────
// CATEGORIAS - Estrutura do Cardápio
// ────────────────────────────────────────────────────────────────────────
// is_builder: true → abre modal de montagem interativa
// is_builder: false → adiciona direto ao carrinho (preço fixo)
// ────────────────────────────────────────────────────────────────────────
export const categories = [
  { id: 'copos-acai',       name: 'Açaís no Copo',          icon: '🍧', is_builder: true },
  { id: 'barcas',           name: 'Barcas de Açaí',         icon: '🛶', is_builder: true },
  { id: 'combos',           name: 'Combos & Promoções',     icon: '🎁', is_builder: false },
  { id: 'picoles-sorvetes', name: 'Picolés & Sorvetes',     icon: '🍭', is_builder: false },
  { id: 'milkshakes',       name: 'Milkshakes',             icon: '🥛', is_builder: false },
  { id: 'bebidas',          name: 'Bebidas',                icon: '🧃', is_builder: false },
  { id: 'lanches',          name: 'Lanches',                icon: '🥐', is_builder: false },
]

// ────────────────────────────────────────────────────────────────────────
// PRODUTOS - Cardápio Completo
// ────────────────────────────────────────────────────────────────────────
// free_toppings: N → até N acompanhamentos grátis; -1 → ilimitado
// prices: { unique: XX } → preço único; { P: XX, M: XX, G: XX } → por tamanho
// image_url: Unsplash URLs alta qualidade
// ────────────────────────────────────────────────────────────────────────
export const products = [

  // ── AÇAÍS NO COPO ───────────────────────────────────────────────────
  {
    id: 'acai-kids',
    category_id: 'copos-acai',
    name: 'Kids 200ml',
    description: 'Para os pequenos. Até 2 acompanhamentos grátis.',
    prices: { unique: 16.00 },
    free_toppings: 2,
    emoji: '🍧',
    image_url: 'https://images.unsplash.com/photo-1590137876181-2a5a7e340308?w=500&q=80',
  },
  {
    id: 'acai-300ml',
    category_id: 'copos-acai',
    name: 'Pequeno 300ml',
    description: 'Perfeito para um lanche. Até 4 acompanhamentos grátis.',
    prices: { unique: 24.00 },
    free_toppings: 4,
    emoji: '🍧',
    image_url: 'https://images.unsplash.com/photo-1590137876181-2a5a7e340308?w=500&q=80',
  },
  {
    id: 'acai-400ml',
    category_id: 'copos-acai',
    name: 'Médio 400ml',
    description: 'O tamanho ideal. Até 6 acompanhamentos grátis.',
    prices: { unique: 32.00 },
    free_toppings: 6,
    emoji: '🍧',
    image_url: 'https://images.unsplash.com/photo-1590137876181-2a5a7e340308?w=500&q=80',
  },
  {
    id: 'acai-500ml',
    category_id: 'copos-acai',
    name: 'Grande 500ml',
    description: 'Para quem ama açaí. Até 8 acompanhamentos grátis.',
    prices: { unique: 39.00 },
    free_toppings: 8,
    emoji: '🍧',
    image_url: 'https://images.unsplash.com/photo-1590137876181-2a5a7e340308?w=500&q=80',
  },
  {
    id: 'acai-700ml',
    category_id: 'copos-acai',
    name: 'Super Premium 700ml',
    description: 'O maior! Acompanhamentos à vontade. Experiência total.',
    prices: { unique: 48.00 },
    free_toppings: -1,
    emoji: '🍧',
    image_url: 'https://images.unsplash.com/photo-1590137876181-2a5a7e340308?w=500&q=80',
  },

  // ── BARCAS DE AÇAÍ ──────────────────────────────────────────────────
  {
    id: 'barca-pequena',
    category_id: 'barcas',
    name: 'Barca Pequena',
    description: 'Barca apresentação. Até 5 acompanhamentos grátis.',
    prices: { unique: 38.00 },
    free_toppings: 5,
    emoji: '🛶',
    image_url: 'https://images.unsplash.com/photo-1590137876181-2a5a7e340308?w=500&q=80',
  },
  {
    id: 'barca-media',
    category_id: 'barcas',
    name: 'Barca Média',
    description: 'Barca clássica. Até 7 acompanhamentos grátis.',
    prices: { unique: 54.00 },
    free_toppings: 7,
    emoji: '🛶',
    image_url: 'https://images.unsplash.com/photo-1590137876181-2a5a7e340308?w=500&q=80',
  },
  {
    id: 'barca-grande',
    category_id: 'barcas',
    name: 'Barca Grande',
    description: 'Barca para compartilhar. Acompanhamentos à vontade.',
    prices: { unique: 72.00 },
    free_toppings: -1,
    emoji: '🛶',
    image_url: 'https://images.unsplash.com/photo-1590137876181-2a5a7e340308?w=500&q=80',
  },
  {
    id: 'barca-executiva',
    category_id: 'barcas',
    name: 'Barca Executiva',
    description: 'Luxo em formato barca. Muitos acompanhamentos grátis.',
    prices: { unique: 65.00 },
    free_toppings: 10,
    emoji: '🛶',
    image_url: 'https://images.unsplash.com/photo-1590137876181-2a5a7e340308?w=500&q=80',
  },

  // ── COMBOS & PROMOÇÕES ──────────────────────────────────────────────
  {
    id: 'combo-casal',
    category_id: 'combos',
    name: 'Combo Casal',
    description: '2x Açaís Médios (400ml) com acompanhamentos à escolha.',
    prices: { unique: 59.00 },
    emoji: '💑',
  },
  {
    id: 'combo-familia',
    category_id: 'combos',
    name: 'Combo Família',
    description: '1 Barca Grande + 4 picolés da casa. Perfeito para reuniões.',
    prices: { unique: 89.00 },
    emoji: '👨‍👩‍👧‍👦',
  },
  {
    id: 'combo-amigos',
    category_id: 'combos',
    name: 'Combo Amigos',
    description: '3x Açaís Grandes + 3 milkshakes à escolha.',
    prices: { unique: 109.00 },
    emoji: '👯',
  },
  {
    id: 'combo-festa',
    category_id: 'combos',
    name: 'Combo Festa (12 pç)',
    description: 'Seleção festiva: 2 Barcas Grandes + 12 Picolés variados.',
    prices: { unique: 179.00 },
    emoji: '🎉',
  },

  // ── PICOLÉS & SORVETES ──────────────────────────────────────────────
  {
    id: 'picole-acai',
    category_id: 'picoles-sorvetes',
    name: 'Picolé de Açaí',
    description: 'Picolé artesanal de açaí 100% puro. Refrescante.',
    prices: { unique: 8.50 },
    emoji: '🍭',
    image_url: 'https://images.unsplash.com/photo-1590137876181-2a5a7e340308?w=500&q=80',
  },
  {
    id: 'picole-morango',
    category_id: 'picoles-sorvetes',
    name: 'Picolé de Morango',
    description: 'Cremoso e suave sabor morango natural.',
    prices: { unique: 8.00 },
    emoji: '🍭',
    image_url: 'https://images.unsplash.com/photo-1590137876181-2a5a7e340308?w=500&q=80',
  },
  {
    id: 'picole-maracuja',
    category_id: 'picoles-sorvetes',
    name: 'Picolé de Maracujá',
    description: 'Refrescante e tropical com toque azedo perfeito.',
    prices: { unique: 8.00 },
    emoji: '🍭',
    image_url: 'https://images.unsplash.com/photo-1590137876181-2a5a7e340308?w=500&q=80',
  },
  {
    id: 'picolé-chocolate',
    category_id: 'picoles-sorvetes',
    name: 'Picolé de Chocolate',
    description: 'Chocolate belga envolvendo picolé de cream.',
    prices: { unique: 9.50 },
    emoji: '🍭',
    image_url: 'https://images.unsplash.com/photo-1590137876181-2a5a7e340308?w=500&q=80',
  },
  {
    id: 'sorvete-pote-300ml',
    category_id: 'picoles-sorvetes',
    name: 'Sorvete no Pote 300ml',
    description: 'Sorvete premium em pote. Escolha 2 sabores diferentes.',
    prices: { unique: 18.00 },
    emoji: '🍦',
    image_url: 'https://images.unsplash.com/photo-1590137876181-2a5a7e340308?w=500&q=80',
  },
  {
    id: 'sorvete-pote-500ml',
    category_id: 'picoles-sorvetes',
    name: 'Sorvete no Pote 500ml',
    description: 'Sorvete premium grande. Escolha 3 sabores diferentes.',
    prices: { unique: 26.00 },
    emoji: '🍦',
    image_url: 'https://images.unsplash.com/photo-1590137876181-2a5a7e340308?w=500&q=80',
  },

  // ── MILKSHAKES ──────────────────────────────────────────────────────
  {
    id: 'shake-acai',
    category_id: 'milkshakes',
    name: 'Milkshake de Açaí',
    description: 'Cremoso milk shake de açaí fresco. 400ml.',
    prices: { unique: 22.00 },
    emoji: '🥛',
    image_url: 'https://images.unsplash.com/photo-1590137876181-2a5a7e340308?w=500&q=80',
  },
  {
    id: 'shake-morango',
    category_id: 'milkshakes',
    name: 'Milkshake de Morango',
    description: 'Refrescante com morango natural e sorvete. 400ml.',
    prices: { unique: 20.00 },
    emoji: '🥛',
    image_url: 'https://images.unsplash.com/photo-1590137876181-2a5a7e340308?w=500&q=80',
  },
  {
    id: 'shake-chocolate',
    category_id: 'milkshakes',
    name: 'Milkshake de Chocolate',
    description: 'Cremoso de chocolate belga com leite integral. 400ml.',
    prices: { unique: 20.00 },
    emoji: '🥛',
    image_url: 'https://images.unsplash.com/photo-1590137876181-2a5a7e340308?w=500&q=80',
  },
  {
    id: 'shake-banana',
    category_id: 'milkshakes',
    name: 'Milkshake de Banana',
    description: 'Clássico com banana e toque de canela. 400ml.',
    prices: { unique: 18.00 },
    emoji: '🥛',
    image_url: 'https://images.unsplash.com/photo-1590137876181-2a5a7e340308?w=500&q=80',
  },
  {
    id: 'shake-misto',
    category_id: 'milkshakes',
    name: 'Milkshake Misto',
    description: 'Combinação de morango, banana e chocolate. 500ml.',
    prices: { unique: 25.00 },
    emoji: '🥛',
    image_url: 'https://images.unsplash.com/photo-1590137876181-2a5a7e340308?w=500&q=80',
  },

  // ── BEBIDAS ─────────────────────────────────────────────────────────
  {
    id: 'agua-mineral-500',
    category_id: 'bebidas',
    name: 'Água Mineral 500ml',
    description: 'Água mineral com ou sem gás.',
    prices: { unique: 5.00 },
    emoji: '💧',
    image_url: 'https://images.unsplash.com/photo-1602088113235-229c19758e9f?w=300&h=300&fit=crop',
  },
  {
    id: 'suco-natural-300',
    category_id: 'bebidas',
    name: 'Suco Natural 300ml',
    description: 'Laranja, limão ou maracujá. Fresco do dia.',
    prices: { unique: 10.00 },
    emoji: '🍊',
    image_url: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd01e3e?w=300&h=300&fit=crop',
  },
  {
    id: 'refrigerante-lata',
    category_id: 'bebidas',
    name: 'Refrigerante 350ml',
    description: 'Coca-Cola, Sprite ou Guaraná gelado.',
    prices: { unique: 6.50 },
    emoji: '🥤',
    image_url: 'https://images.unsplash.com/photo-1554866585-d34d2c3aee6c?w=300&h=300&fit=crop',
  },
  {
    id: 'energetico',
    category_id: 'bebidas',
    name: 'Energético 250ml',
    description: 'Energy drink premium para mais energia.',
    prices: { unique: 12.00 },
    emoji: '⚡',
    image_url: 'https://images.unsplash.com/photo-1599599810724-8249cba80f80?w=300&h=300&fit=crop',
  },
  {
    id: 'cha-gelado',
    category_id: 'bebidas',
    name: 'Chá Gelado 400ml',
    description: 'Chá gelado de frutas vermelhas. Refrescante.',
    prices: { unique: 8.00 },
    emoji: '🫖',
    image_url: 'https://images.unsplash.com/photo-1599599810724-8249cba80f81?w=300&h=300&fit=crop',
  },

  // ── LANCHES ─────────────────────────────────────────────────────────
  {
    id: 'croissant',
    category_id: 'lanches',
    name: 'Croissant Amanteigado',
    description: 'Croissant fresco, amanteigado e crocante.',
    prices: { unique: 8.50 },
    emoji: '🥐',
    image_url: 'https://images.unsplash.com/photo-1527521060660-15cd12a73e0e?w=300&h=300&fit=crop',
  },
  {
    id: 'muffin-chocolate',
    category_id: 'lanches',
    name: 'Muffin de Chocolate',
    description: 'Muffin com gotas de chocolate belga.',
    prices: { unique: 9.00 },
    emoji: '🧁',
    image_url: 'https://images.unsplash.com/photo-1609779871055-72a50e5eaa8e?w=300&h=300&fit=crop',
  },
  {
    id: 'brownie',
    category_id: 'lanches',
    name: 'Brownie Premium',
    description: 'Brownie denso e delicioso de chocolate.',
    prices: { unique: 10.00 },
    emoji: '🍫',
    image_url: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=300&h=300&fit=crop',
  },
  {
    id: 'cookie-gotas',
    category_id: 'lanches',
    name: 'Cookie de Chocolate',
    description: 'Cookie crocante com gotas de chocolate.',
    prices: { unique: 6.50 },
    emoji: '🍪',
    image_url: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=300&h=300&fit=crop',
  },
  {
    id: 'bolo-fatia',
    category_id: 'lanches',
    name: 'Fatia de Bolo',
    description: 'Bolo do dia conforme disponibilidade.',
    prices: { unique: 11.00 },
    emoji: '🍰',
    image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&h=300&fit=crop',
  },
]
