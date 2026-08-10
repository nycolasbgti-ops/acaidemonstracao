import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

const normalizeAddon = (a) => ({ key: a.id, label: a.name, price: Number(a.price) })

function groupAddons(list) {
  const grouped = { massa: [], calda: [], acompanhamento: [], extra: [] }
  for (const a of (list || [])) {
    if (grouped[a.category]) grouped[a.category].push(normalizeAddon(a))
  }
  return grouped
}

export function useMenu() {
  const [categories, setCategories] = useState([])
  const [products,   setProducts]   = useState([])
  const [addons,     setAddons]     = useState({ massa: [], calda: [], acompanhamento: [], extra: [] })
  const [bannerUrl,  setBannerUrl]  = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)

  useEffect(() => {
    supabase
      .from('settings')
      .select('banner_url')
      .eq('id', 1)
      .single()
      .then(({ data, error }) => {
        if (error) throw error
        setBannerUrl(data?.banner_url || null)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    Promise.all([
      supabase.from('categories').select('*').eq('active', true).order('order_position'),
      supabase.from('products').select('*').eq('active', true).order('order_position'),
      supabase.from('addons').select('*').eq('active', true).order('category').order('order_position'),
    ])
      .then(([catRes, prodRes, addonRes]) => {
        if (catRes.error)   throw catRes.error
        if (prodRes.error)  throw prodRes.error
        if (addonRes.error) throw addonRes.error

        setCategories(catRes.data || [])
        setProducts(prodRes.data || [])
        setAddons(groupAddons(addonRes.data))
      })
      .catch((e) => {
        console.error('Erro ao carregar cardápio do Supabase:', e)
        setCategories([])
        setProducts([])
        setError('Cardápio indisponível no momento.')
      })
      .finally(() => setLoading(false))
  }, [])

  const byCategory = products.reduce((acc, p) => {
    if (!acc[p.category_id]) acc[p.category_id] = []
    acc[p.category_id].push(p)
    return acc
  }, {})

  return { categories, products, byCategory, addons, bannerUrl, loading, error }
}
