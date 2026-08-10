const BASE = process.env.REACT_APP_API_URL ?? ''

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  })
  if (res.status === 204) return null
  const json = await res.json()
  if (!res.ok) throw new Error(json.error ?? res.statusText)
  return json
}

async function compressImage(file, maxWidth = 1000, quality = 0.8) {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale = Math.min(1, maxWidth / img.width)
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      canvas.getContext('2d').drawImage(img, 0, 0, w, h)
      canvas.toBlob(blob => resolve(blob ?? file), 'image/jpeg', quality)
    }
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file) }
    img.src = url
  })
}

export const api = {
  // ── Público ──────────────────────────────────────────────────
  getMenu:     ()         => request('GET',   '/api/menu'),
  getSettings: ()         => request('GET',   '/api/settings'),
  createOrder: (data)     => request('POST',  '/api/orders', data),

  // ── Admin: Pedidos ────────────────────────────────────────────
  getOrders:   ()         => request('GET',   '/api/orders'),
  getOrdersByPhone: (phone) => request('GET', `/api/orders/by-phone?phone=${encodeURIComponent(phone)}`),
  updateOrder: (id, data) => request('PATCH', `/api/orders/${id}`, data),
  ordersEvents: ()        => new EventSource(`${BASE}/api/orders/events`),

  // ── Admin: Categorias ─────────────────────────────────────────
  getCategories:  ()         => request('GET',    '/api/categories'),
  createCategory: (data)     => request('POST',   '/api/categories', data),
  updateCategory: (id, data) => request('PATCH',  `/api/categories/${id}`, data),
  deleteCategory: (id)       => request('DELETE', `/api/categories/${id}`),

  // ── Admin: Produtos ───────────────────────────────────────────
  getProducts:   (catId)     => request('GET',    `/api/products${catId ? `?category_id=${catId}` : ''}`),
  createProduct: (data)      => request('POST',   '/api/products', data),
  updateProduct: (id, data)  => request('PATCH',  `/api/products/${id}`, data),
  deleteProduct: (id)        => request('DELETE', `/api/products/${id}`),

  // ── Admin: Acompanhamentos (legado) ──────────────────────────
  getToppings:   ()          => request('GET',    '/api/toppings'),
  createTopping: (data)      => request('POST',   '/api/toppings', data),
  updateTopping: (id, data)  => request('PATCH',  `/api/toppings/${id}`, data),
  deleteTopping: (id)        => request('DELETE', `/api/toppings/${id}`),

  // ── Admin: Adicionais (massas, caldas, acompanhamentos, extras) ──
  getAddons:    ()          => request('GET',    '/api/addons'),
  createAddon:  (data)      => request('POST',   '/api/addons', data),
  updateAddon:  (id, data)  => request('PATCH',  `/api/addons/${id}`, data),
  deleteAddon:  (id)        => request('DELETE', `/api/addons/${id}`),

  // ── Admin: Configurações ──────────────────────────────────────
  updateSettings: (data) => request('PATCH', '/api/settings', data),

  // ── Admin: Upload de imagem ───────────────────────────────────
  uploadImage: async (file) => {
    const compressed = await compressImage(file)
    const form = new FormData()
    form.append('image', compressed)
    const res = await fetch(`${BASE}/api/upload`, { method: 'POST', body: form })
    if (!res.ok) {
      const text = await res.text()
      let msg
      try { msg = JSON.parse(text).error } catch { msg = null }
      if (!msg) msg = res.status === 413 ? 'A foto é muito pesada! Por favor, escolha uma imagem menor ou comprimida.' : `Erro no upload (${res.status})`
      throw new Error(msg)
    }
    return res.json()
  },
}
