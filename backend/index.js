import express from 'express'
import cors from 'cors'
import multer from 'multer'
import pg from 'pg'
import path from 'path'
import { fileURLToPath } from 'url'

const { Pool } = pg
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT || 3001
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const app = express()

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// ── SSE broadcast ─────────────────────────────────────────────
const sseClients = new Set()

function broadcast(event, data) {
  for (const client of sseClients) {
    client.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
  }
}

// ── Público: Cardápio ─────────────────────────────────────────

app.get('/api/menu', async (req, res) => {
  try {
    const [catRes, prodRes] = await Promise.all([
      pool.query('SELECT * FROM categories WHERE active = true ORDER BY order_position'),
      pool.query('SELECT * FROM products   WHERE active = true ORDER BY order_position'),
    ])
    res.json({ categories: catRes.rows, products: prodRes.rows })
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

    const result = await pool.query(
      `INSERT INTO orders
         (customer_name, customer_phone, delivery_type, address,
          payment_method, change_for, items, total, notes, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'new')
       RETURNING *`,
      [customer_name, customer_phone, delivery_type, address,
       payment_method, change_for, JSON.stringify(items), total, notes],
    )
    const order = result.rows[0]
    broadcast('order-insert', order)
    res.status(201).json(order)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ── Admin: SSE de pedidos (registrar antes do PATCH :id) ──────

app.get('/api/orders/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  sseClients.add(res)
  res.write('event: connected\ndata: {}\n\n')

  const heartbeat = setInterval(() => res.write(':ping\n\n'), 25_000)
  req.on('close', () => { clearInterval(heartbeat); sseClients.delete(res) })
})

// ── Admin: Listar e atualizar pedidos ─────────────────────────

app.get('/api/orders', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM orders ORDER BY created_at DESC LIMIT 200',
    )
    res.json(result.rows)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.patch('/api/orders/:id', async (req, res) => {
  try {
    const { status } = req.body
    const result = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id],
    )
    if (!result.rows.length) return res.status(404).json({ error: 'Pedido não encontrado' })
    const order = result.rows[0]
    broadcast('order-update', order)
    res.json(order)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ── Admin: Categorias ─────────────────────────────────────────

app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY order_position')
    res.json(result.rows)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.post('/api/categories', async (req, res) => {
  try {
    const { name, slug, icon, order_position, is_builder } = req.body
    const result = await pool.query(
      'INSERT INTO categories (name, slug, icon, order_position, is_builder, active) VALUES ($1,$2,$3,$4,$5,true) RETURNING *',
      [name, slug, icon, order_position, is_builder],
    )
    res.status(201).json(result.rows[0])
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.patch('/api/categories/:id', async (req, res) => {
  try {
    const allowed = ['name', 'slug', 'icon', 'order_position', 'is_builder', 'active']
    const updates = Object.entries(req.body).filter(([k]) => allowed.includes(k))
    if (!updates.length) return res.status(400).json({ error: 'Nenhum campo válido enviado' })

    const sets   = updates.map(([k], i) => `${k} = $${i + 1}`).join(', ')
    const values = [...updates.map(([, v]) => v), req.params.id]

    const result = await pool.query(
      `UPDATE categories SET ${sets} WHERE id = $${values.length} RETURNING *`,
      values,
    )
    if (!result.rows.length) return res.status(404).json({ error: 'Categoria não encontrada' })
    res.json(result.rows[0])
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.delete('/api/categories/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM categories WHERE id = $1', [req.params.id])
    res.status(204).end()
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ── Admin: Produtos ───────────────────────────────────────────

app.get('/api/products', async (req, res) => {
  try {
    const { category_id } = req.query
    const query  = category_id
      ? 'SELECT * FROM products WHERE category_id = $1 ORDER BY order_position'
      : 'SELECT * FROM products ORDER BY order_position'
    const params = category_id ? [category_id] : []
    const result = await pool.query(query, params)
    res.json(result.rows)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.post('/api/products', async (req, res) => {
  try {
    const { category_id, name, description, prices, is_sweet, image_url, active, order_position } = req.body
    const result = await pool.query(
      `INSERT INTO products
         (category_id, name, description, prices, is_sweet, image_url, active, order_position)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [category_id, name, description, JSON.stringify(prices), is_sweet, image_url, active, order_position],
    )
    res.status(201).json(result.rows[0])
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.patch('/api/products/:id', async (req, res) => {
  try {
    const allowed = ['category_id', 'name', 'description', 'prices', 'is_sweet', 'image_url', 'active', 'order_position']
    const raw     = req.body
    const updates = Object.entries(raw).filter(([k]) => allowed.includes(k))
    if (!updates.length) return res.status(400).json({ error: 'Nenhum campo válido enviado' })

    const values = updates.map(([k, v]) => k === 'prices' ? JSON.stringify(v) : v)
    const sets   = updates.map(([k], i) => `${k} = $${i + 1}`).join(', ')
    values.push(req.params.id)

    const result = await pool.query(
      `UPDATE products SET ${sets} WHERE id = $${values.length} RETURNING *`,
      values,
    )
    if (!result.rows.length) return res.status(404).json({ error: 'Produto não encontrado' })
    res.json(result.rows[0])
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.delete('/api/products/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id = $1', [req.params.id])
    res.status(204).end()
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ── Admin: Configurações ──────────────────────────────────────

app.get('/api/settings', async (req, res) => {
  try {
    const result = await pool.query('SELECT pix_key, whatsapp_number FROM settings WHERE id = 1')
    res.json(result.rows[0] ?? { pix_key: '', whatsapp_number: '' })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.patch('/api/settings', async (req, res) => {
  try {
    const { pix_key, whatsapp_number } = req.body
    const result = await pool.query(
      'UPDATE settings SET pix_key=$1, whatsapp_number=$2 WHERE id=1 RETURNING pix_key, whatsapp_number',
      [pix_key, whatsapp_number],
    )
    res.json(result.rows[0])
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ── Admin: Upload de imagem ───────────────────────────────────

const storage = multer.diskStorage({
  destination: path.join(__dirname, 'uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, `${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`)
  },
})
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } })

app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado' })
  res.json({ url: `${BASE_URL}/uploads/${req.file.filename}` })
})

// ── Start ─────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Açaí Concept API rodando na porta ${PORT}`)
})
