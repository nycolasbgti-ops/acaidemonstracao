import React, { useState } from 'react'
import { fmt, getBasePrice } from '../utils/price'

export default function FlavorPickerModal({ product, onClose, onAdd }) {
  const unitPrice = getBasePrice(product.prices)
  const [qtys, setQtys] = useState({})

  const inc = (name) => setQtys(prev => ({ ...prev, [name]: (prev[name] || 0) + 1 }))
  const dec = (name) => setQtys(prev => {
    const q = (prev[name] || 0) - 1
    if (q <= 0) {
      const next = { ...prev }
      delete next[name]
      return next
    }
    return { ...prev, [name]: q }
  })

  const totalQty = Object.values(qtys).reduce((s, q) => s + q, 0)
  const total    = unitPrice * totalQty

  const handleAdd = () => {
    if (totalQty === 0) return
    const flavors = (product.flavors || [])
      .map(name => ({ name, qty: qtys[name] || 0 }))
      .filter(f => f.qty > 0)
    onAdd({
      id:      product.id,
      name:    product.name,
      type:    'flavored',
      price:   unitPrice,
      qty:     totalQty,
      flavors,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm animate-fadeIn" onClick={onClose} />

      <div className="relative bg-zinc-900 rounded-t-3xl max-h-[85vh] flex flex-col animate-slideUp">

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-0 flex-shrink-0">
          <div className="w-10 h-1 bg-white/15 rounded-full" />
        </div>

        {/* Cabeçalho */}
        <div className="px-5 pt-3 pb-4 border-b border-white/[0.07] flex-shrink-0 flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-[17px] font-semibold text-white leading-snug">{product.name}</h2>
            <p className="text-sm text-zinc-400 mt-0.5">{fmt(unitPrice)} por unidade</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 mt-0.5 bg-white/[0.07] rounded-full flex items-center justify-center
                       hover:bg-white/[0.12] transition-all active:scale-90 flex-shrink-0"
          >
            <svg className="w-[14px] h-[14px] text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Seção de sabores */}
        <div className="px-5 pt-5 pb-2 flex-shrink-0">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-[15px] font-semibold text-white">Escolha os Sabores</h3>
            {totalQty > 0 && (
              <span className="text-[11px] font-medium bg-white/10 text-white rounded px-2 py-0.5 flex-shrink-0">
                {totalQty} un.
              </span>
            )}
          </div>
          <p className="text-[12px] text-zinc-500 mt-1">Use + e − para escolher a quantidade de cada sabor</p>
        </div>

        {/* Lista de sabores */}
        <div className="overflow-y-auto flex-1">
          <div>
            {(product.flavors || []).map((name, i) => {
              const q = qtys[name] || 0
              const isLast = i === (product.flavors || []).length - 1
              return (
                <div
                  key={name}
                  className={`flex items-center justify-between px-5 py-4 transition-colors
                              ${q > 0 ? 'bg-white/[0.03]' : ''}
                              ${!isLast ? 'border-b border-white/[0.05]' : ''}`}
                >
                  <span className={`text-[15px] flex-1 ${q > 0 ? 'text-white font-medium' : 'text-zinc-200'}`}>
                    {name}
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => dec(name)}
                      disabled={q === 0}
                      className="w-7 h-7 rounded-full border border-white/[0.12] flex items-center justify-center
                                 text-zinc-300 text-lg font-light active:scale-90 transition-transform
                                 hover:border-white/20 hover:text-white disabled:opacity-25 disabled:cursor-not-allowed"
                    >
                      −
                    </button>
                    <span className={`text-[15px] font-semibold w-5 text-center tabular-nums ${
                      q > 0 ? 'text-white' : 'text-zinc-600'
                    }`}>
                      {q}
                    </span>
                    <button
                      onClick={() => inc(name)}
                      className="w-7 h-7 rounded-full border border-white/[0.12] flex items-center justify-center
                                 text-zinc-300 text-lg font-light active:scale-90 transition-transform
                                 hover:border-white/20 hover:text-white"
                    >
                      +
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="h-4" />
        </div>

        {/* Rodapé */}
        <div className="border-t border-white/[0.08] bg-zinc-900 px-5 pt-4 pb-8 flex-shrink-0">
          {totalQty > 0 && (
            <p className="text-xs text-zinc-500 mb-3 truncate">
              {Object.entries(qtys).filter(([, q]) => q > 0).map(([n, q]) => `${q}× ${n}`).join(' · ')}
            </p>
          )}
          <button
            onClick={handleAdd}
            disabled={totalQty === 0}
            className={`w-full py-3.5 rounded-2xl font-semibold text-[15px] flex items-center justify-between px-5
                        transition-all active:scale-[0.98] ${
              totalQty > 0
                ? 'bg-white text-zinc-900'
                : 'bg-white/[0.07] text-zinc-600 cursor-not-allowed'
            }`}
          >
            <span>{totalQty > 0 ? 'Adicionar' : 'Escolha pelo menos 1 sabor'}</span>
            {totalQty > 0 && <span className="font-bold">{fmt(total)}</span>}
          </button>
        </div>
      </div>
    </div>
  )
}
