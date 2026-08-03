import React, { useState, useEffect } from 'react'
import { api } from '../../api'
import { fmt } from '../../utils/price'

const CATEGORIES = [
  { key: 'massa',          label: 'Massas',           icon: '🍧' },
  { key: 'calda',          label: 'Caldas',            icon: '🍯' },
  { key: 'acompanhamento', label: 'Acompanhamentos',   icon: '🥝' },
  { key: 'extra',          label: 'Extras Pagos',      icon: '✨' },
]

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
  if (value === '' || value == null || value === 0) return ''
  return formatCurrency(Math.round(Number(value) * 100))
}

const inputCls = 'w-full bg-[#242424] rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-purple-700 transition-all text-sm'

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs text-gray-500 block mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function AddonForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState(
    initial
      ? { category: initial.category, name: initial.name, price: toDisplayPrice(initial.price), order_position: initial.order_position }
      : { category: 'acompanhamento', name: '', price: '', order_position: 0 }
  )
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handlePriceChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '')
    if (!digits) { set('price', ''); return }
    set('price', formatCurrency(parseInt(digits, 10)))
  }

  return (
    <div className="space-y-4">
      <Field label="Categoria *">
        <select value={form.category} onChange={e => set('category', e.target.value)} className={inputCls}>
          {CATEGORIES.map(c => (
            <option key={c.key} value={c.key}>{c.icon} {c.label}</option>
          ))}
        </select>
      </Field>

      <Field label="Nome *">
        <input
          type="text"
          value={form.name}
          onChange={e => set('name', e.target.value)}
          placeholder="Ex: Leite Ninho, Nutella..."
          className={inputCls}
        />
      </Field>

      <Field label="Preço (R$ 0,00 = grátis)">
        <input
          type="text"
          inputMode="numeric"
          value={form.price}
          onChange={handlePriceChange}
          placeholder="0,00"
          className={inputCls}
        />
        <p className="text-xs text-gray-600 mt-1">
          Deixe em 0,00 para acompanhamento/calda grátis. Use um valor para extras pagos.
        </p>
      </Field>

      <Field label="Posição na lista (número menor = aparece primeiro)">
        <input
          type="number"
          value={form.order_position}
          onChange={e => set('order_position', e.target.value)}
          min={0}
          className={inputCls}
        />
      </Field>

      <div className="flex gap-3 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 py-3.5 bg-[#242424] rounded-2xl text-sm font-semibold text-gray-400 active:scale-95 transition-all">
          Cancelar
        </button>
        <button
          onClick={() => onSave({ ...form, price: parseCurrency(form.price), order_position: parseInt(form.order_position) || 0 })}
          disabled={saving || !form.name.trim()}
          className="flex-1 py-3.5 bg-purple-700 rounded-2xl text-sm font-bold active:scale-95 transition-all disabled:opacity-50">
          {saving ? 'Salvando...' : initial ? 'Salvar' : 'Criar'}
        </button>
      </div>
    </div>
  )
}

export default function AddonsManager() {
  const [addons,     setAddons]     = useState([])
  const [activeTab,  setActiveTab]  = useState('massa')
  const [screen,     setScreen]     = useState('list')
  const [editing,    setEditing]    = useState(null)
  const [saving,     setSaving]     = useState(false)
  const [error,      setError]      = useState('')
  const [loading,    setLoading]    = useState(true)

  const load = async () => {
    try {
      const data = await api.getAddons()
      setAddons(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const save = async (form) => {
    setSaving(true)
    setError('')
    try {
      if (editing) {
        const updated = await api.updateAddon(editing.id, form)
        setAddons(prev => prev.map(a => a.id === editing.id ? updated : a))
      } else {
        const created = await api.createAddon(form)
        setAddons(prev => [...prev, created])
      }
      setScreen('list')
      setEditing(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (addon) => {
    try {
      const updated = await api.updateAddon(addon.id, { active: !addon.active })
      setAddons(prev => prev.map(a => a.id === addon.id ? updated : a))
    } catch (e) {
      setError(e.message)
    }
  }

  const del = async (addon) => {
    if (!window.confirm(`Excluir "${addon.name}"?`)) return
    try {
      await api.deleteAddon(addon.id)
      setAddons(prev => prev.filter(a => a.id !== addon.id))
    } catch (e) {
      setError(e.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 border-2 border-purple-700 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (screen === 'form') {
    return (
      <div>
        <button
          onClick={() => { setScreen('list'); setEditing(null) }}
          className="flex items-center gap-1.5 text-sm text-gray-400 mb-4 active:text-white transition-colors -ml-1 px-1 py-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Voltar
        </button>
        <h3 className="text-lg font-bold mb-5">{editing ? 'Editar Adicional' : 'Novo Adicional'}</h3>
        {error && <p className="text-red-400 text-sm mb-4 bg-red-500/10 rounded-xl px-4 py-2">{error}</p>}
        <AddonForm
          initial={editing}
          onSave={save}
          onCancel={() => { setScreen('list'); setEditing(null) }}
          saving={saving}
        />
      </div>
    )
  }

  const catInfo     = CATEGORIES.find(c => c.key === activeTab)
  const visibleList = addons.filter(a => a.category === activeTab)

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-bold">Adicionais</h3>
          <p className="text-xs text-gray-500">Massas, caldas, acompanhamentos e extras do builder</p>
        </div>
        <button
          onClick={() => { setEditing(null); setScreen('form') }}
          className="px-4 py-2 bg-purple-700 rounded-full text-sm font-bold active:scale-95 transition-all">
          + Novo
        </button>
      </div>

      {error && <p className="text-red-400 text-sm mb-4 bg-red-500/10 rounded-xl px-4 py-2">{error}</p>}

      {/* Category tabs */}
      <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
        {CATEGORIES.map(c => (
          <button
            key={c.key}
            onClick={() => setActiveTab(c.key)}
            className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === c.key
                ? 'bg-purple-700 text-white'
                : 'bg-[#242424] text-gray-400'
            }`}>
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      {visibleList.length === 0 ? (
        <div className="text-center py-12">
          <span className="text-4xl block mb-3">{catInfo?.icon}</span>
          <p className="text-gray-500 text-sm">Nenhum item em {catInfo?.label}.</p>
          <button
            onClick={() => { setEditing(null); setScreen('form') }}
            className="mt-4 px-5 py-2.5 bg-[#1A1A1A] rounded-full text-sm font-semibold text-gray-300 active:scale-95 transition-all">
            Criar primeiro
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {visibleList.map(addon => (
            <div
              key={addon.id}
              className={`bg-[#1A1A1A] rounded-2xl p-4 flex items-center gap-3 ${!addon.active ? 'opacity-40' : ''}`}>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-white">{addon.name}</p>
                <p className="text-xs mt-0.5">
                  {Number(addon.price) > 0
                    ? <span className="text-amber-400">+ {fmt(addon.price)}</span>
                    : <span className="text-gray-500">Grátis</span>
                  }
                </p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => toggleActive(addon)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-xs transition-colors ${
                    addon.active ? 'bg-green-500/15 text-green-400' : 'bg-[#2C2C2E] text-gray-500'
                  }`}
                  title={addon.active ? 'Desativar' : 'Ativar'}>
                  {addon.active ? '●' : '○'}
                </button>
                <button
                  onClick={() => { setEditing(addon); setScreen('form') }}
                  className="w-10 h-10 bg-[#2C2C2E] rounded-full flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => del(addon)}
                  className="w-10 h-10 bg-red-500/15 rounded-full flex items-center justify-center active:bg-red-500/30 transition-colors"
                  title="Excluir">
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

      <div className="mt-6 bg-[#1A1A1A] rounded-2xl p-4 border border-purple-800/20">
        <p className="text-xs text-purple-400 font-semibold mb-1">💡 Como funciona</p>
        <p className="text-xs text-gray-500 leading-relaxed">
          <strong className="text-gray-300">Massas</strong> aparecem como seleção obrigatória. <strong className="text-gray-300">Caldas</strong> e <strong className="text-gray-300">Acompanhamentos</strong> são opcionais (grátis). <strong className="text-gray-300">Extras</strong> com preço &gt; 0 são cobrados à parte no builder.
        </p>
      </div>
    </div>
  )
}
