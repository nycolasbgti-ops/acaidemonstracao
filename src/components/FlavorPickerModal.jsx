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
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-acai-surface rounded-t-3xl max-h-[80vh] flex flex-col animate-slideUp shadow-2xl">

        {/* Handle */}
        <div className="flex justify-center pt-4 pb-2 flex-shrink-0">
          <div className="w-12 h-1 bg-white/15 rounded-full" />
        </div>

        {/* Cabeçalho */}
        <div className="px-5 pt-2 pb-4 border-b border-white/5 flex-shrink-0 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Escolha os Sabores</h2>
            <p className="text-xs text-gray-500 mt-1">{product.name} · {fmt(unitPrice)} cada</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center
                       hover:bg-white/10 transition-all active:scale-90 flex-shrink-0">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Lista de sabores */}
        <div className="overflow-y-auto flex-1 px-5 py-4">
          <p className="text-xs text-gray-500 mb-4">
            Use + e − para escolher a quantidade de cada sabor.
          </p>
          <div className="space-y-2.5">
            {(product.flavors || []).map(name => {
              const q = qtys[name] || 0
              return (
                <div
                  key={name}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    q > 0
                      ? 'bg-gradient-to-r from-acai-accent/15 to-acai-accent/10 border-acai-accent/40'
                      : 'bg-acai-raised border-purple-800/20'
                  }`}
                >
                  <p className={`font-semibold text-sm ${q > 0 ? 'text-white' : 'text-gray-300'}`}>{name}</p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => dec(name)}
                      disabled={q === 0}
                      className="w-8 h-8 rounded-full bg-acai-dark flex items-center justify-center text-gray-400
                                 active:scale-90 transition-transform disabled:opacity-30 hover:bg-acai-surface">
                      −
                    </button>
                    <span className={`font-bold text-lg w-5 text-center ${q > 0 ? 'text-acai-accent' : 'text-gray-600'}`}>
                      {q}
                    </span>
                    <button
                      onClick={() => inc(name)}
                      className="w-8 h-8 rounded-full bg-gradient-to-r from-acai-accent to-acai-accent-lt flex items-center justify-center text-white
                                 active:scale-90 transition-transform shadow-md shadow-acai-accent/40">
                      +
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Rodapé */}
        <div className="px-5 pt-4 pb-8 border-t border-white/5 flex-shrink-0 bg-acai-surface">
          {totalQty > 0 && (
            <div className="mb-3 bg-gradient-to-r from-acai-accent to-acai-accent-lt/10 border border-[#DB2777]/25 rounded-2xl px-4 py-2.5 text-center">
              <p className="text-xs text-acai-accent">
                <span className="font-bold">{totalQty} unidade(s)</span>
                {' · '}
                {Object.entries(qtys).filter(([, q]) => q > 0).map(([n, q]) => `${q}× ${n}`).join(', ')}
              </p>
            </div>
          )}
          <button
            onClick={handleAdd}
            disabled={totalQty === 0}
            className={`w-full py-4 rounded-2xl font-bold text-[15px] flex items-center justify-between px-6
                        transition-all active:scale-[0.98] shadow-lg ${
              totalQty > 0
                ? 'bg-gradient-to-r from-acai-accent to-acai-accent-lt text-white shadow-acai-accent/40'
                : 'bg-acai-raised text-gray-600 cursor-not-allowed opacity-50'
            }`}
          >
            <span>{totalQty > 0 ? 'Adicionar ao Carrinho' : 'Escolha pelo menos 1 sabor'}</span>
            {totalQty > 0 && (
              <span className="font-bold text-base bg-white/20 px-3 py-1 rounded-full">
                {fmt(total)}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
