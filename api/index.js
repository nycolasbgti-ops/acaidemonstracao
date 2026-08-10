import express from 'express'
import cors from 'cors'
import multer from 'multer'
import { supabase } from './supabaseClient.js'

const app = express()
app.use(cors())
app.use(express.json())

// ── Público: Cardápio completo ────────────────────────────────

app.get('/api/menu', async (req, res) => {
  try {
    const [cats, prods, addons] = await Promise.all([
      supabase.from('categories').select('*').eq('active', true).order('order_position'),
      supabase.from('products').select('*').eq('active', true).order('order_position'),
      supabase.from('addons').select('*').eq('active', true).order('order_position'),
    ])
    if (cats.error) throw cats.error
    if (prods.error) throw prods.error
    res.json({
      categories: cats.data,
      products:   prods.data,
      addons:     addons.data ?? [],
    })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ── Público: Criar pedido ─────────────────────────────────────

app.post('/api/orders', async (req, res) => {
  try {
    const {
      customer_name, customer_phone, delivery_type,
      address, payment_method, change_for,
      items, total, notes,
    } = req.body

    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        customer_name, customer_phone, delivery_type,
        address, payment_method, change_for,
        items, total, notes, status: 'new',
      })
      .select()
      .single()

    if (error) throw error
    res.status(201).json(order)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ── Público: Pedidos por telefone ─────────────────────────────

app.get('/api/orders/by-phone', async (req, res) => {
  try {
    const phone = String(req.query.phone ?? '').replace(/\D/g, '')
    if (phone.length < 8) return res.status(400).json({ error: 'Telefone inválido' })
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .ilike('customer_phone', `%${phone}%`)
      .order('created_at', { ascending: false })
      .limit(20)
    if (error) throw error
    res.json(data)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ── Admin: Listar pedidos ─────────────────────────────────────

app.get('/api/orders', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)
    if (error) throw error
    res.json(data)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.patch('/api/orders/:id', async (req, res) => {
  try {
    const { status } = req.body
    const { data: order, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', req.params.id)
      .select()
      .single()
    if (error) throw error
    if (!order) return res.status(404).json({ error: 'Pedido não encontrado' })
    res.json(order)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ── Admin: SSE de pedidos ─────────────────────────────────────
// AVISO: SSE não funciona em Vercel Serverless (timeout).
// Use Supabase Realtime no frontend para atualizações em tempo real:
//   supabase.channel('orders').on('postgres_changes', ...).subscribe()

app.get('/api/orders/events', (req, res) => {
  res.status(501).json({
    error: 'SSE não suportado em Serverless. Use Supabase Realtime no frontend.',
    docs: 'https://supabase.com/docs/guides/realtime',
  })
})

// ── Admin: Categorias ─────────────────────────────────────────

app.get('/api/categories', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('order_position')
    if (error) throw error
    res.json(data)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.post('/api/categories', async (req, res) => {
  try {
    const { name, slug, icon, order_position, is_builder } = req.body
    const { data, error } = await supabase
      .from('categories')
      .insert({ name, slug, icon, order_position, is_builder, active: true })
      .select()
      .single()
    if (error) throw error
    res.status(201).json(data)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.patch('/api/categories/:id', async (req, res) => {
  try {
    const allowed = ['name', 'slug', 'icon', 'order_position', 'is_builder', 'active']
    const patch = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => allowed.includes(k))
    )
    if (!Object.keys(patch).length) return res.status(400).json({ error: 'Nenhum campo válido' })

    const { data, error } = await supabase
      .from('categories')
      .update(patch)
      .eq('id', req.params.id)
      .select()
      .single()
    if (error) throw error
    if (!data) return res.status(404).json({ error: 'Categoria não encontrada' })
    res.json(data)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.delete('/api/categories/:id', async (req, res) => {
  try {
    const { error } = await supabase.from('categories').delete().eq('id', req.params.id)
    if (error) throw error
    res.status(204).end()
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ── Admin: Produtos ───────────────────────────────────────────

app.get('/api/products', async (req, res) => {
  try {
    let query = supabase.from('products').select('*').order('order_position')
    if (req.query.category_id) query = query.eq('category_id', req.query.category_id)
    const { data, error } = await query
    if (error) throw error
    res.json(data)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.post('/api/products', async (req, res) => {
  try {
    const { category_id, name, description, prices, free_toppings, emoji, image_url, active, order_position, flavors, builder_config } = req.body
    const { data, error } = await supabase
      .from('products')
      .insert({ category_id, name, description, prices, free_toppings, emoji, image_url, active, order_position, flavors: flavors ?? [], builder_config: builder_config ?? {} })
      .select()
      .single()
    if (error) throw error
    res.status(201).json(data)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.patch('/api/products/:id', async (req, res) => {
  try {
    const allowed = ['category_id', 'name', 'description', 'prices', 'free_toppings', 'emoji', 'image_url', 'active', 'order_position', 'flavors', 'builder_config']
    const patch = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => allowed.includes(k))
    )
    if (!Object.keys(patch).length) return res.status(400).json({ error: 'Nenhum campo válido' })

    const { data, error } = await supabase
      .from('products')
      .update(patch)
      .eq('id', req.params.id)
      .select()
      .single()
    if (error) throw error
    if (!data) return res.status(404).json({ error: 'Produto não encontrado' })
    res.json(data)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.delete('/api/products/:id', async (req, res) => {
  try {
    const { error } = await supabase.from('products').delete().eq('id', req.params.id)
    if (error) throw error
    res.status(204).end()
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ── Admin: Acompanhamentos ────────────────────────────────────

app.get('/api/toppings', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('toppings')
      .select('*')
      .order('order_position')
    if (error) throw error
    res.json(data)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.post('/api/toppings', async (req, res) => {
  try {
    const { key, name, price, order_position } = req.body
    const { data, error } = await supabase
      .from('toppings')
      .insert({ key, name, price: price ?? 0, order_position, active: true })
      .select()
      .single()
    if (error) throw error
    res.status(201).json(data)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.patch('/api/toppings/:id', async (req, res) => {
  try {
    const allowed = ['key', 'name', 'price', 'active', 'order_position']
    const patch = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => allowed.includes(k))
    )
    const { data, error } = await supabase
      .from('toppings')
      .update(patch)
      .eq('id', req.params.id)
      .select()
      .single()
    if (error) throw error
    res.json(data)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.delete('/api/toppings/:id', async (req, res) => {
  try {
    const { error } = await supabase.from('toppings').delete().eq('id', req.params.id)
    if (error) throw error
    res.status(204).end()
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ── Admin: Adicionais ─────────────────────────────────────────

app.get('/api/addons', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('addons')
      .select('*')
      .order('category')
      .order('order_position')
    if (error) throw error
    res.json(data)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.post('/api/addons', async (req, res) => {
  try {
    const { category, name, price, order_position } = req.body
    const { data, error } = await supabase
      .from('addons')
      .insert({ category, name, price: price ?? 0, order_position: order_position ?? 0, active: true })
      .select()
      .single()
    if (error) throw error
    res.status(201).json(data)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.patch('/api/addons/:id', async (req, res) => {
  try {
    const allowed = ['category', 'name', 'price', 'active', 'order_position']
    const patch = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => allowed.includes(k))
    )
    if (!Object.keys(patch).length) return res.status(400).json({ error: 'Nenhum campo válido' })
    const { data, error } = await supabase
      .from('addons')
      .update(patch)
      .eq('id', req.params.id)
      .select()
      .single()
    if (error) throw error
    if (!data) return res.status(404).json({ error: 'Adicional não encontrado' })
    res.json(data)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.delete('/api/addons/:id', async (req, res) => {
  try {
    const { error } = await supabase.from('addons').delete().eq('id', req.params.id)
    if (error) throw error
    res.status(204).end()
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ── Admin: Configurações ──────────────────────────────────────

app.get('/api/settings', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('pix_key, whatsapp_number, banner_url')
      .eq('id', 1)
      .single()
    if (error) throw error
    res.json(data ?? { pix_key: '', whatsapp_number: '', banner_url: null })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.patch('/api/settings', async (req, res) => {
  try {
    const { pix_key, whatsapp_number, banner_url } = req.body
    const { data, error } = await supabase
      .from('settings')
      .update({ pix_key, whatsapp_number, banner_url })
      .eq('id', 1)
      .select('pix_key, whatsapp_number, banner_url')
      .single()
    if (error) throw error
    res.json(data)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ── Admin: Upload de imagem (Supabase Storage) ────────────────

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } })

app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado' })

    const ext      = req.file.originalname.split('.').pop().toLowerCase()
    const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filename, req.file.buffer, { contentType: req.file.mimetype })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filename)

    res.json({ url: publicUrl })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Exporta para Vercel Serverless (não chama app.listen)
export default app
