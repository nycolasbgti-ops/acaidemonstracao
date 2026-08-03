import React, { useState, useEffect, useRef } from 'react'
import { api } from '../../api'
import { fmt } from '../../utils/price'

// ── Helpers ──────────────────────────────────────────────────

const toSlug = (name) =>
  name.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const EMPTY_CAT  = { name: '', icon: '🍧', order_position: 0, is_builder: false }
const EMPTY_PROD = { name: '', description: '', category_id: '', priceType: 'sized', priceUnique: '', priceP: '', sizeLabel1: '', priceM: '', sizeLabel2: '', priceG: '', sizeLabel3: '', image_url: '', active: true, order_position: 0, flavors: [], builder_config: { has_toppings: true, allowed_bases: [] } }

// ── Currency mask helpers ─────────────────────────────────────

const formatCurrency = (cents) => {
  const int = Math.floor(cents / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  const dec = (cents % 100).toString().padStart(2, '0')
  return `${int},${dec}`
}

const parseCurrency = (display) => {
  const digits = String(display || '').replace(/\D/g, '')
  return digits ? parseInt(digits, 10) / 100 : 0
}

const toDisplayPrice = (value) => {
  if (value === '' || value == null) return ''
  return formatCurrency(Math.round(Number(value) * 100))
}

// ── Sub-components ────────────────────────────────────────────

function SectionTitle({ children }) {
  return <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">{children}</p>
}

function ToggleRow({ label, sub, value, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold text-white">{label}</p>
        {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`w-12 h-6 rounded-full transition-all relative flex-shrink-0 ${value ? 'bg-[#FF3B30]' : 'bg-[#3A3A3C]'}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${value ? 'left-6' : 'left-0.5'}`} />
      </button>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs text-gray-500 block mb-1.5">{label}</label>
      {children}
    </div>
  )
}

const inputCls = "w-full bg-[#242424] rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-[#FF3B30] transition-all text-sm"

// ── Category Form ─────────────────────────────────────────────

function CategoryForm({ initial, onSave, onCancel, saving }) {
  const iconInputRef = useRef()
  const [uploading, setUploading] = useState(false)
  const [uploadErr, setUploadErr] = useState('')
  const [form, setForm] = useState(
    initial
      ? { name: initial.name, icon: initial.icon, order_position: initial.order_position, is_builder: initial.is_builder }
      : { ...EMPTY_CAT }
  )
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleIconFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    setUploadErr('')
    try {
      const { url } = await api.uploadImage(file)
      set('icon', url)
    } catch (err) {
      setUploadErr('Erro no upload: ' + err.message)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const isIconUrl = form.icon && (form.icon.startsWith('http') || form.icon.startsWith('/'))

  return (
    <div className="space-y-4">
      <Field label="Nome da categoria *">
        <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
          placeholder="Ex: Pastéis, Porções" className={inputCls} />
      </Field>

      <Field label="Ícone (Emoji ou URL da Imagem) *">
        <div className="flex items-center gap-3">
          <input type="text" value={form.icon} onChange={e => set('icon', e.target.value)}
            placeholder="🍕 ou https://..." className={`${inputCls} flex-1`} disabled={uploading} />
          <button type="button" onClick={() => iconInputRef.current?.click()} disabled={uploading}
            title="Enviar foto"
            className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-[#242424] rounded-xl border border-purple-800/30 hover:border-purple-500 transition-colors disabled:opacity-50">
            {uploading
              ? <svg className="w-5 h-5 animate-spin text-purple-400" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
              : <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            }
          </button>
          <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-[#242424] rounded-xl">
            {isIconUrl
              ? <img src={form.icon} alt="preview" className="w-10 h-10 object-contain rounded" />
              : <span className="text-2xl">{form.icon}</span>
            }
          </div>
          <input ref={iconInputRef} type="file" accept="image/*" className="hidden" onChange={handleIconFile} />
        </div>
        {uploading && <p className="text-xs text-purple-400 mt-1">Enviando foto...</p>}
        {uploadErr && <p className="text-xs text-red-400 mt-1">{uploadErr}</p>}
      </Field>

      <Field label="Posição na barra (número menor = aparece primeiro)">
        <input type="number" value={form.order_position} onChange={e => set('order_position', e.target.value)}
          min={0} className={inputCls} />
      </Field>

      <div className="bg-[#242424] rounded-xl p-4">
        <ToggleRow
          label="Categoria com Montagem"
          sub="Ativa o modal de montagem de Açaí (massa, acompanhamentos, adicionais)"
          value={form.is_builder}
          onChange={v => set('is_builder', v)}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={onCancel}
          className="flex-1 py-3.5 bg-[#242424] rounded-2xl text-sm font-semibold text-gray-400 active:scale-95 transition-all">
          Cancelar
        </button>
        <button onClick={() => onSave(form)} disabled={saving || !form.name.trim()}
          className="flex-1 py-3.5 bg-[#FF3B30] rounded-2xl text-sm font-bold active:scale-95 transition-all disabled:opacity-50">
          {saving ? 'Salvando...' : initial ? 'Salvar' : 'Criar Categoria'}
        </button>
      </div>
    </div>
  )
}

// ── Product Form ──────────────────────────────────────────────

function ProductForm({ initial, categories, defaultCategoryId, onSave, onCancel, saving }) {
  const fileInputRef = useRef()
  const [uploading,    setUploading]    = useState(false)
  const [preview,      setPreview]      = useState(initial?.image_url || '')
  const [uploadErr,    setUploadErr]    = useState('')
  const [flavorInput,  setFlavorInput]  = useState('')
  const [baseInput,    setBaseInput]    = useState('')

  const initForm = () => {
    if (!initial) return { ...EMPTY_PROD, category_id: defaultCategoryId || categories[0]?.id || '' }
    const hasSized = initial.prices?.unique === undefined
    return {
      name:           initial.name,
      description:    initial.description || '',
      category_id:    initial.category_id,
      priceType:      hasSized ? 'sized' : 'unique',
      priceUnique:    toDisplayPrice(initial.prices?.unique),
      priceP:         toDisplayPrice(initial.prices?.P),
      sizeLabel1:     initial.prices?.labels?.P || '',
      priceM:         toDisplayPrice(initial.prices?.M),
      sizeLabel2:     initial.prices?.labels?.M || '',
      priceG:         toDisplayPrice(initial.prices?.G),
      sizeLabel3:     initial.prices?.labels?.G || '',
      image_url:      initial.image_url || '',
      active:         initial.active ?? true,
      order_position: initial.order_position ?? 0,
      flavors:        initial.flavors || [],
      builder_config: initial.builder_config || { has_toppings: true, allowed_bases: [] },
    }
  }

  const addFlavor = () => {
    const v = flavorInput.trim()
    if (!v || form.flavors.includes(v)) return
    set('flavors', [...form.flavors, v])
    setFlavorInput('')
  }

  const removeFlavor = (i) => set('flavors', form.flavors.filter((_, idx) => idx !== i))

  const [form, setForm] = useState(initForm)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const setBuilderConfig = (key, value) =>
    set('builder_config', { ...(form.builder_config || {}), [key]: value })

  const addAllowedBase = () => {
    const v = baseInput.trim()
    if (!v || (form.builder_config?.allowed_bases || []).includes(v)) return
    setBuilderConfig('allowed_bases', [...(form.builder_config?.allowed_bases || []), v])
    setBaseInput('')
  }
  const removeAllowedBase = (i) =>
    setBuilderConfig('allowed_bases', (form.builder_config?.allowed_bases || []).filter((_, idx) => idx !== i))

  const handlePriceChange = (key) => (e) => {
    const digits = e.target.value.replace(/\D/g, '')
    if (!digits) { set(key, ''); return }
    set(key, formatCurrency(parseInt(digits, 10)))
  }

  const selectedCat = categories.find(c => c.id === form.category_id)

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    setUploadErr('')
    try {
      const { url } = await api.uploadImage(file)
      setPreview(url)
      set('image_url', url)
    } catch (err) {
      setUploadErr('Erro no upload: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Field label="Categoria *">
        <select value={form.category_id} onChange={e => set('category_id', e.target.value)} className={inputCls}>
          <option value="">Selecione...</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
          ))}
        </select>
      </Field>

      <Field label="Nome do produto *">
        <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
          placeholder="Ex: Copo 500ml, Picolé de Morango..." className={inputCls} />
      </Field>

      <Field label="Descrição">
        <textarea value={form.description} onChange={e => set('description', e.target.value)}
          placeholder="Ingredientes, destaques..." rows={3}
          className={`${inputCls} resize-none`} />
      </Field>

      {/* Tipo de preço */}
      <div>
        <SectionTitle>Preço</SectionTitle>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {[
            { v: 'sized',  label: 'Por Tamanho', sub: '3 tamanhos' },
            { v: 'unique', label: 'Preço Único',  sub: 'Um valor só' },
          ].map(opt => (
            <button key={opt.v} onClick={() => set('priceType', opt.v)}
              className={`py-2.5 px-4 rounded-xl text-left transition-all border ${
                form.priceType === opt.v
                  ? 'bg-[#FF3B30]/15 border-[#FF3B30]'
                  : 'bg-[#242424] border-transparent text-gray-400'
              }`}>
              <p className="font-semibold text-sm">{opt.label}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">{opt.sub}</p>
            </button>
          ))}
        </div>

        {form.priceType === 'unique' ? (
          <input type="text" inputMode="numeric" value={form.priceUnique}
            onChange={handlePriceChange('priceUnique')}
            placeholder="0,00" className={inputCls} />
        ) : (
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { key: 'priceP', labelKey: 'sizeLabel1', ph: '300ml' },
              { key: 'priceM', labelKey: 'sizeLabel2', ph: '500ml' },
              { key: 'priceG', labelKey: 'sizeLabel3', ph: '700ml' },
            ].map(({ key, labelKey, ph }) => (
              <div key={key} className="space-y-1">
                <input
                  type="text"
                  value={form[labelKey]}
                  onChange={e => set(labelKey, e.target.value)}
                  placeholder={ph}
                  className="w-full bg-[#2C2C2E] rounded-lg px-1.5 py-2 text-white text-xs outline-none focus:ring-1 focus:ring-[#FF3B30] transition-all placeholder-gray-700 text-center"
                />
                <input type="text" inputMode="numeric" value={form[key]}
                  onChange={handlePriceChange(key)}
                  placeholder="0,00"
                  className="w-full bg-[#242424] rounded-xl px-2 py-3 text-white text-sm outline-none focus:ring-2 focus:ring-[#FF3B30] transition-all placeholder-gray-600 text-center" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload de imagem */}
      <div>
        <SectionTitle>Imagem do Produto</SectionTitle>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />

        {preview ? (
          <div className="relative">
            <img src={preview} alt="preview" className="w-full h-36 object-cover rounded-2xl" />
            <button
              onClick={() => fileInputRef.current.click()}
              className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl
                         text-sm font-semibold text-white opacity-0 hover:opacity-100 transition-opacity active:opacity-100">
              {uploading ? 'Enviando...' : 'Trocar imagem'}
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current.click()}
            disabled={uploading}
            className="w-full h-28 bg-[#242424] rounded-2xl border-2 border-dashed border-white/10
                       flex flex-col items-center justify-center gap-1.5 active:bg-[#2C2C2E] transition-colors">
            {uploading ? (
              <div className="w-6 h-6 border-2 border-[#FF3B30] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs text-gray-500">Toque para adicionar imagem</span>
              </>
            )}
          </button>
        )}
        {uploadErr && <p className="text-red-400 text-xs mt-1">{uploadErr}</p>}
      </div>

      {/* ── Sabores ──────────────────────────────────────────── */}
      <div>
        <SectionTitle>Sabores</SectionTitle>
        <p className="text-xs text-gray-600 mb-3 -mt-1">
          Opcional — use para produtos com variações (ex: Picolés, Moreninhas). O cliente escolhe as quantidades de cada sabor.
        </p>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={flavorInput}
            onChange={e => setFlavorInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addFlavor() } }}
            placeholder="Nome do sabor (ex: Flocos, Crocantito...)"
            className={`${inputCls} flex-1`}
          />
          <button
            type="button"
            onClick={addFlavor}
            disabled={!flavorInput.trim()}
            className="px-4 py-3 bg-[#FF3B30] rounded-xl text-sm font-bold disabled:opacity-40 flex-shrink-0 active:scale-95 transition-all">
            +
          </button>
        </div>
        {form.flavors.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {form.flavors.map((f, i) => (
              <div key={i} className="flex items-center gap-1.5 bg-[#242424] rounded-full px-3 py-1.5">
                <span className="text-sm text-white">{f}</span>
                <button
                  type="button"
                  onClick={() => removeFlavor(i)}
                  className="w-4 h-4 bg-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-white text-xs leading-none">
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Regras de Montagem (só aparece se a categoria for is_builder) ── */}
      {selectedCat?.is_builder && (
        <div className="bg-[#1A1A1A] rounded-2xl p-4 space-y-4 border border-purple-800/30">
          <div>
            <p className="text-xs font-semibold text-purple-400 uppercase tracking-widest mb-0.5">⚙️ Regras de Montagem</p>
            <p className="text-xs text-gray-600">Controle granular do builder para este produto específico.</p>
          </div>

          <ToggleRow
            label="Caldas, Acompanhamentos e Extras"
            sub="Desative para exibir apenas a seleção de massa (ex: Milkshakes)"
            value={form.builder_config?.has_toppings ?? true}
            onChange={v => setBuilderConfig('has_toppings', v)}
          />

          <div>
            <label className="text-xs text-gray-500 block mb-1">Massas Específicas (Opcional)</label>
            <p className="text-[11px] text-gray-600 mb-2 leading-relaxed">
              Se vazio, usa as massas globais. Se preenchido, o cliente só poderá escolher estas opções.
            </p>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={baseInput}
                onChange={e => setBaseInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addAllowedBase() } }}
                placeholder="Ex: Açaí Tradicional, Morango..."
                className="flex-1 bg-[#242424] rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-600 outline-none focus:ring-2 focus:ring-purple-700 transition-all"
              />
              <button
                type="button"
                onClick={addAllowedBase}
                disabled={!baseInput.trim()}
                className="px-4 py-2.5 bg-purple-700 rounded-xl text-sm font-bold disabled:opacity-40 flex-shrink-0 active:scale-95 transition-all">
                +
              </button>
            </div>
            {(form.builder_config?.allowed_bases || []).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {(form.builder_config.allowed_bases).map((b, i) => (
                  <div key={i} className="flex items-center gap-1.5 bg-purple-900/40 border border-purple-700/40 rounded-full px-3 py-1.5">
                    <span className="text-xs text-purple-200">{b}</span>
                    <button
                      type="button"
                      onClick={() => removeAllowedBase(i)}
                      className="w-4 h-4 bg-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-white text-xs leading-none">
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <Field label="Posição na lista (número menor = aparece primeiro)">
        <input type="number" value={form.order_position} onChange={e => set('order_position', e.target.value)}
          min={0} className={inputCls} />
      </Field>

      <div className="bg-[#242424] rounded-xl p-4">
        <ToggleRow
          label="Produto Ativo"
          sub="Desative para ocultar do cardápio sem excluir"
          value={form.active}
          onChange={v => set('active', v)}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={onCancel}
          className="flex-1 py-3.5 bg-[#242424] rounded-2xl text-sm font-semibold text-gray-400 active:scale-95 transition-all">
          Cancelar
        </button>
        <button
          onClick={() => onSave(form)}
          disabled={saving || uploading || !form.name.trim() || !form.category_id}
          className="flex-1 py-3.5 bg-[#FF3B30] rounded-2xl text-sm font-bold active:scale-95 transition-all disabled:opacity-50">
          {saving ? 'Salvando...' : initial ? 'Salvar' : 'Criar Produto'}
        </button>
      </div>
    </div>
  )
}

// ── Main MenuManager ──────────────────────────────────────────

export default function MenuManager() {
  const [screen,      setScreen]      = useState('categories')
  const [categories,  setCategories]  = useState([])
  const [products,    setProducts]    = useState([])
  const [activeCat,   setActiveCat]   = useState(null)
  const [editingCat,  setEditingCat]  = useState(null)
  const [editingProd, setEditingProd] = useState(null)
  const [saving,      setSaving]      = useState(false)
  const [error,       setError]       = useState('')
  const [loading,     setLoading]     = useState(true)

  // ── Data fetching ──────────────────────────────────────────

  const loadCategories = async () => {
    const data = await api.getCategories()
    setCategories(data)
  }

  const loadProducts = async (catId) => {
    if (!catId) return
    const data = await api.getProducts(catId)
    setProducts(data)
  }

  useEffect(() => {
    loadCategories().catch(e => setError(e.message)).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (activeCat) loadProducts(activeCat.id).catch(e => setError(e.message))
  }, [activeCat])

  // ── Save category ──────────────────────────────────────────

  const saveCategory = async (form) => {
    setSaving(true)
    setError('')
    try {
      const payload = {
        name:           form.name.trim(),
        slug:           toSlug(form.name),
        icon:           form.icon.trim() || '🍽️',
        order_position: parseInt(form.order_position) || 0,
        is_builder:       form.is_builder,
      }
      if (editingCat) {
        await api.updateCategory(editingCat.id, payload)
      } else {
        await api.createCategory(payload)
      }
      await loadCategories()
      setScreen('categories')
      setEditingCat(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  // ── Toggle category active ─────────────────────────────────

  const toggleCatActive = async (cat) => {
    try {
      await api.updateCategory(cat.id, { active: !cat.active })
      await loadCategories()
    } catch (e) {
      setError(e.message)
    }
  }

  // ── Delete category ────────────────────────────────────────

  const deleteCategory = async (cat) => {
    const ok = window.confirm(
      `Excluir a categoria "${cat.name}"?\n\n⚠️ ATENÇÃO: todos os produtos desta categoria serão excluídos permanentemente junto com ela (exclusão em cascata).\n\nEsta ação não pode ser desfeita.`
    )
    if (!ok) return
    setError('')
    try {
      await api.deleteCategory(cat.id)
      setCategories(prev => prev.filter(c => c.id !== cat.id))
      if (activeCat?.id === cat.id) { setActiveCat(null); setScreen('categories') }
    } catch (e) {
      setError(e.message)
    }
  }

  // ── Save product ───────────────────────────────────────────

  const saveProduct = async (form) => {
    setSaving(true)
    setError('')
    try {
      const sizeLabels = {}
      if (form.sizeLabel1?.trim()) sizeLabels.P = form.sizeLabel1.trim()
      if (form.sizeLabel2?.trim()) sizeLabels.M = form.sizeLabel2.trim()
      if (form.sizeLabel3?.trim()) sizeLabels.G = form.sizeLabel3.trim()

      const prices = form.priceType === 'unique'
        ? { unique: parseCurrency(form.priceUnique) }
        : {
            P: parseCurrency(form.priceP),
            M: parseCurrency(form.priceM),
            G: parseCurrency(form.priceG),
            ...(Object.keys(sizeLabels).length ? { labels: sizeLabels } : {}),
          }

      const payload = {
        category_id:    form.category_id,
        name:           form.name.trim(),
        description:    form.description.trim() || null,
        prices,
        image_url:      form.image_url || null,
        active:         form.active,
        order_position: parseInt(form.order_position) || 0,
        flavors:        form.flavors || [],
        builder_config: form.builder_config || {},
      }

      if (editingProd) {
        await api.updateProduct(editingProd.id, payload)
      } else {
        await api.createProduct(payload)
      }

      await loadProducts(form.category_id)
      const newCat = categories.find(c => c.id === form.category_id)
      if (newCat) setActiveCat(newCat)
      setScreen('products')
      setEditingProd(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  // ── Toggle product active ──────────────────────────────────

  const toggleProdActive = async (prod) => {
    try {
      await api.updateProduct(prod.id, { active: !prod.active })
      await loadProducts(activeCat?.id)
    } catch (e) {
      setError(e.message)
    }
  }

  // ── Delete product ─────────────────────────────────────────

  const deleteProduct = async (prod) => {
    const ok = window.confirm(`Excluir o produto "${prod.name}"?\n\nEsta ação não pode ser desfeita.`)
    if (!ok) return
    setError('')
    try {
      await api.deleteProduct(prod.id)
      setProducts(prev => prev.filter(p => p.id !== prod.id))
    } catch (e) {
      setError(e.message)
    }
  }

  // ── Render helpers ─────────────────────────────────────────

  const BackButton = ({ label, onClick }) => (
    <button onClick={onClick}
      className="flex items-center gap-1.5 text-sm text-gray-400 mb-4 active:text-white transition-colors -ml-1 px-1 py-2">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      {label}
    </button>
  )

  const formatPrices = (prices) => {
    if (!prices) return '—'
    if (prices.unique !== undefined) return fmt(prices.unique)
    const parts = []
    if (prices.P !== undefined) parts.push(`${prices.labels?.P || 'P'}: ${fmt(prices.P)}`)
    if (prices.M !== undefined) parts.push(`${prices.labels?.M || 'M'}: ${fmt(prices.M)}`)
    if (prices.G !== undefined) parts.push(`${prices.labels?.G || 'G'}: ${fmt(prices.G)}`)
    return parts.join(' · ')
  }

  // ── Screens ────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 border-2 border-[#FF3B30] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (screen === 'cat-form') {
    return (
      <div>
        <BackButton label="Categorias" onClick={() => { setScreen('categories'); setEditingCat(null) }} />
        <h3 className="text-lg font-bold mb-5">{editingCat ? 'Editar Categoria' : 'Nova Categoria'}</h3>
        {error && <p className="text-red-400 text-sm mb-4 bg-red-500/10 rounded-xl px-4 py-2">{error}</p>}
        <CategoryForm
          initial={editingCat}
          onSave={saveCategory}
          onCancel={() => { setScreen('categories'); setEditingCat(null) }}
          saving={saving}
        />
      </div>
    )
  }

  if (screen === 'prod-form') {
    return (
      <div>
        <BackButton label={activeCat?.name || 'Produtos'} onClick={() => { setScreen('products'); setEditingProd(null) }} />
        <h3 className="text-lg font-bold mb-5">{editingProd ? 'Editar Produto' : 'Novo Produto'}</h3>
        {error && <p className="text-red-400 text-sm mb-4 bg-red-500/10 rounded-xl px-4 py-2">{error}</p>}
        <ProductForm
          initial={editingProd}
          categories={categories}
          defaultCategoryId={activeCat?.id}
          onSave={saveProduct}
          onCancel={() => { setScreen('products'); setEditingProd(null) }}
          saving={saving}
        />
      </div>
    )
  }

  if (screen === 'products' && activeCat) {
    return (
      <div>
        <BackButton label="Categorias" onClick={() => setScreen('categories')} />
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              {activeCat.icon && (activeCat.icon.startsWith('http') || activeCat.icon.startsWith('/'))
                ? <img src={activeCat.icon} alt={activeCat.name} className="w-8 h-8 object-contain rounded flex-shrink-0" />
                : <span>{activeCat.icon}</span>
              }
              {activeCat.name}
            </h3>
            <p className="text-xs text-gray-500">{products.length} produto(s)</p>
          </div>
          <button
            onClick={() => { setEditingProd(null); setScreen('prod-form') }}
            className="px-4 py-2 bg-[#FF3B30] rounded-full text-sm font-bold active:scale-95 transition-all">
            + Produto
          </button>
        </div>

        {error && <p className="text-red-400 text-sm mb-4 bg-red-500/10 rounded-xl px-4 py-2">{error}</p>}

        {products.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-4xl block mb-3">📦</span>
            <p className="text-gray-500 text-sm">Nenhum produto nesta categoria.</p>
            <button
              onClick={() => { setEditingProd(null); setScreen('prod-form') }}
              className="mt-4 px-5 py-2.5 bg-[#1A1A1A] rounded-full text-sm font-semibold text-gray-300 active:scale-95 transition-all">
              Criar primeiro produto
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {products.map(prod => (
              <div key={prod.id}
                className={`bg-[#1A1A1A] rounded-2xl p-4 flex items-center gap-3 ${!prod.active ? 'opacity-40' : ''}`}>
                <div className="w-14 h-14 bg-[#242424] rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {prod.image_url
                    ? <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover" />
                    : <span className="text-2xl">🍕</span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-white leading-snug truncate">{prod.name}</p>
                  <p className="text-xs text-[#FF9500] mt-0.5">{formatPrices(prod.prices)}</p>
                  {!prod.active && <span className="text-[10px] text-gray-600">● Inativo</span>}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => toggleProdActive(prod)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-xs transition-colors ${
                      prod.active ? 'bg-green-500/15 text-green-400' : 'bg-[#2C2C2E] text-gray-500'
                    }`}
                    title={prod.active ? 'Desativar' : 'Ativar'}>
                    {prod.active ? '●' : '○'}
                  </button>
                  <button
                    onClick={() => { setEditingProd(prod); setScreen('prod-form') }}
                    className="w-10 h-10 bg-[#2C2C2E] rounded-full flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => deleteProduct(prod)}
                    className="w-10 h-10 bg-red-500/15 rounded-full flex items-center justify-center active:bg-red-500/30 transition-colors"
                    title="Excluir produto">
                    <svg className="w-3.5 h-3.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Category list (default)
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-bold">Categorias</h3>
          <p className="text-xs text-gray-500">{categories.length} categoria(s)</p>
        </div>
        <button
          onClick={() => { setEditingCat(null); setScreen('cat-form') }}
          className="px-4 py-2 bg-[#FF3B30] rounded-full text-sm font-bold active:scale-95 transition-all">
          + Categoria
        </button>
      </div>

      {error && <p className="text-red-400 text-sm mb-4 bg-red-500/10 rounded-xl px-4 py-2">{error}</p>}

      {categories.length === 0 ? (
        <div className="text-center py-12">
          <span className="text-4xl block mb-3">🗂️</span>
          <p className="text-gray-500 text-sm">Nenhuma categoria ainda.</p>
          <p className="text-gray-600 text-xs mt-1">Execute o Docker e suba o banco para carregar as categorias iniciais.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map(cat => (
            <div key={cat.id} className={`bg-[#1A1A1A] rounded-2xl flex items-center ${!cat.active ? 'opacity-40' : ''}`}>
              <button
                onClick={() => { setActiveCat(cat); setScreen('products') }}
                className="flex-1 flex items-center gap-3 p-4 active:opacity-70 transition-opacity text-left">
                <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
                  {cat.icon && (cat.icon.startsWith('http') || cat.icon.startsWith('/'))
                    ? <img src={cat.icon} alt={cat.name} className="w-8 h-8 object-contain rounded" />
                    : <span className="text-2xl">{cat.icon}</span>
                  }
                </div>
                <div className="flex-1 min-w-0 overflow-hidden">
                  <p className="font-bold text-sm text-white">{cat.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {cat.is_builder ? '🍧 Com montagem' : '📋 Simples'} · Ordem {cat.order_position}
                  </p>
                </div>
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <div className="flex items-center gap-1 pr-2">
                <button
                  onClick={() => toggleCatActive(cat)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-xs transition-colors ${
                    cat.active ? 'bg-green-500/15 text-green-400' : 'bg-[#2C2C2E] text-gray-500'
                  }`}
                  title={cat.active ? 'Desativar' : 'Ativar'}>
                  {cat.active ? '●' : '○'}
                </button>
                <button
                  onClick={() => { setEditingCat(cat); setScreen('cat-form') }}
                  className="w-10 h-10 bg-[#2C2C2E] rounded-full flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => deleteCategory(cat)}
                  className="w-10 h-10 bg-red-500/15 rounded-full flex items-center justify-center active:bg-red-500/30 transition-colors"
                  title="Excluir categoria">
                  <svg className="w-3.5 h-3.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 bg-[#1A1A1A] rounded-2xl p-4 border border-yellow-500/20">
        <p className="text-xs text-yellow-400 font-semibold mb-1">⚠️ Sobre itens inativos</p>
        <p className="text-xs text-gray-500 leading-relaxed">
          Itens desativados (●○) ficam ocultos no cardápio mas permanecem no banco de dados.
        </p>
      </div>
    </div>
  )
}
