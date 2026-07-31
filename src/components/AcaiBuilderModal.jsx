import React, { useState } from 'react'
import { fmt, getBasePrice } from '../utils/price'

// addons = { massa: [...], calda: [...], acompanhamento: [...], extra: [...] }
export default function AcaiBuilderModal({ product, addons = {}, onClose, onAdd }) {
  const config       = product.builder_config || {}
  const hasToppings  = config.has_toppings ?? true
  const allowedBases = config.allowed_bases  || []

  const globalBases = addons.massa          || []
  const caldas      = addons.calda          || []
  const toppings    = addons.acompanhamento || []
  const extras      = addons.extra          || []

  // Se o produto tem massas restritas, usa apenas elas; caso contrário usa as globais
  const bases = allowedBases.length > 0
    ? allowedBases.map(name => ({ key: name, label: name, price: 0 }))
    : globalBases

  const [selectedBase,     setSelectedBase]     = useState(null)
  const [selectedCaldas,   setSelectedCaldas]   = useState([])
  const [selectedToppings, setSelectedToppings] = useState([])
  const [selectedExtras,   setSelectedExtras]   = useState([])
  const [qty,              setQty]              = useState(1)

  const basePrice    = getBasePrice(product.prices)
  const caldaTotal   = selectedCaldas.reduce((s, c) => s + c.price, 0)
  const extrasTotal  = selectedExtras.reduce((s, e) => s + e.price, 0)
  const unitPrice    = basePrice + caldaTotal + extrasTotal
  const total        = unitPrice * qty

  const freeToppingsLimit = product.free_toppings ?? 4
  const isUnlimited       = freeToppingsLimit === -1
  const atLimit           = !isUnlimited && selectedToppings.length >= freeToppingsLimit

  const toggleCalda = (calda) => {
    setSelectedCaldas(prev => {
      const exists = prev.some(c => c.key === calda.key)
      return exists ? prev.filter(c => c.key !== calda.key) : [...prev, calda]
    })
  }

  const toggleTopping = (topping) => {
    setSelectedToppings(prev => {
      const exists = prev.some(t => t.key === topping.key)
      if (exists) return prev.filter(t => t.key !== topping.key)
      if (!isUnlimited && prev.length >= freeToppingsLimit) return prev
      return [...prev, topping]
    })
  }

  const toggleExtra = (extra) => {
    setSelectedExtras(prev => {
      const exists = prev.some(e => e.key === extra.key)
      return exists ? prev.filter(e => e.key !== extra.key) : [...prev, extra]
    })
  }

  const canAdd = selectedBase !== null

  const handleAdd = () => {
    if (!canAdd) return
    onAdd({
      id:       `${product.id}-${Date.now()}`,
      name:     product.name,
      type:     'acai',
      base:     selectedBase,
      caldas:   selectedCaldas,
      toppings: selectedToppings,
      extras:   selectedExtras,
      price:    unitPrice,
      qty,
    })
  }

  const completedSteps = [
    selectedBase !== null,
    hasToppings && caldas.length > 0 && selectedCaldas.length > 0,
    hasToppings && selectedToppings.length > 0,
    hasToppings && extras.length > 0 && selectedExtras.length > 0,
  ].filter(Boolean).length
  const totalSections = hasToppings
    ? 2 + (caldas.length > 0 ? 1 : 0) + (extras.length > 0 ? 1 : 0)
    : 1
  const progressPercent = (completedSteps / totalSections) * 100

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-acai-surface rounded-t-3xl max-h-[85vh] flex flex-col animate-slideUp shadow-2xl">

        {/* Barra de progresso */}
        <div className="w-full h-1 bg-gray-800 rounded-t-3xl overflow-hidden flex-shrink-0">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Handle */}
        <div className="flex justify-center pt-4 pb-2 flex-shrink-0">
          <div className="w-12 h-1 bg-white/15 rounded-full" />
        </div>

        {/* Cabeçalho */}
        <div className="px-5 pt-2 pb-4 border-b border-white/5 flex-shrink-0 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Personalize seu pedido</h2>
            <p className="text-xs text-gray-500 mt-1">{product.name} · {fmt(basePrice)}</p>
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

        {/* Corpo rolável */}
        <div className="overflow-y-auto flex-1 px-5 py-5 space-y-8">

          {/* ── Passo 1: Massa ─────────────────────────────────── */}
          <section>
            <StepHeader number={1} title="Escolha a Massa" subtitle="Obrigatório · Seleção única" amber />

            {bases.length === 0 ? (
              <p className="text-xs text-gray-500 bg-acai-raised rounded-xl px-4 py-3">
                Nenhuma massa cadastrada. Adicione no painel admin → Adicionais.
              </p>
            ) : (
              <div className="space-y-2.5">
                {bases.map(base => {
                  const isSelected = selectedBase?.key === base.key
                  return (
                    <button
                      key={base.key}
                      onClick={() => setSelectedBase(base)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all border text-left group ${
                        isSelected
                          ? 'bg-gradient-to-r from-amber-400/20 to-amber-500/20 border-amber-400/50 shadow-lg shadow-amber-500/20'
                          : 'bg-acai-raised border-purple-800/30 hover:border-purple-700/50'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-amber-400 border-amber-400 shadow-lg shadow-amber-500/40'
                          : 'border-gray-600 group-hover:border-gray-500'
                      }`}>
                        {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      <p className={`font-semibold text-sm leading-snug ${isSelected ? 'text-amber-100' : 'text-gray-200'}`}>
                        {base.label}
                      </p>
                    </button>
                  )
                })}
              </div>
            )}
          </section>

          {/* ── Passos 2-4: só exibidos se hasToppings === true ─ */}
          {/* ── Passo 2: Caldas (se houver) ───────────────────── */}
          {hasToppings && caldas.length > 0 && (
            <section>
              <StepHeader number={2} title="Caldas" subtitle="Opcional · Múltipla escolha" />

              <div className="grid grid-cols-2 gap-2.5">
                {caldas.map(calda => {
                  const isSelected = selectedCaldas.some(c => c.key === calda.key)
                  return (
                    <button
                      key={calda.key}
                      onClick={() => toggleCalda(calda)}
                      className={`flex items-center gap-2.5 p-3.5 rounded-2xl transition-all border text-left group ${
                        isSelected
                          ? 'bg-gradient-to-r from-amber-400/20 to-amber-500/20 border-amber-400/50'
                          : 'bg-acai-raised border-purple-800/30 hover:border-purple-700/50'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        isSelected ? 'bg-amber-400 border-amber-400' : 'border-gray-600 group-hover:border-gray-500'
                      }`}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`text-sm font-medium leading-snug ${isSelected ? 'text-amber-100' : 'text-gray-300'}`}>
                          {calda.label}
                        </span>
                        {calda.price > 0 && (
                          <p className="text-xs text-amber-400 mt-0.5">+ {fmt(calda.price)}</p>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </section>
          )}

          {/* ── Passo 3: Acompanhamentos Grátis ───────────────── */}
          {hasToppings && <section>
            <div className="flex items-center gap-3 mb-4">
              <StepBadge number={hasToppings && caldas.length > 0 ? 3 : 2} amber />
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-base font-bold text-white">Acompanhamentos</p>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    atLimit ? 'bg-amber-400/25 text-amber-300' : 'bg-amber-400/15 text-amber-400'
                  }`}>
                    {isUnlimited
                      ? '∞ À vontade'
                      : `Até ${freeToppingsLimit} opções (${selectedToppings.length}/${freeToppingsLimit})`
                    }
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">Múltipla escolha</p>
              </div>
            </div>

            {!isUnlimited && (
              <div className="mb-3 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, (selectedToppings.length / freeToppingsLimit) * 100)}%`,
                    background: 'linear-gradient(90deg, #D97706, #FCD34D)',
                  }}
                />
              </div>
            )}

            {atLimit && (
              <div className="mb-4 bg-amber-400/10 border border-amber-400/30 rounded-2xl px-4 py-3 flex items-start gap-2">
                <svg className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-xs text-amber-300 leading-relaxed">
                  Limite de <span className="font-bold">{freeToppingsLimit} acompanhamentos</span> atingido.
                </p>
              </div>
            )}

            {toppings.length === 0 ? (
              <p className="text-xs text-gray-500 bg-acai-raised rounded-xl px-4 py-3">
                Nenhum acompanhamento cadastrado.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                {toppings.map(topping => {
                  const isSelected = selectedToppings.some(t => t.key === topping.key)
                  const isDisabled = !isSelected && atLimit
                  return (
                    <button
                      key={topping.key}
                      onClick={() => toggleTopping(topping)}
                      disabled={isDisabled}
                      className={`flex items-center gap-2.5 p-3.5 rounded-2xl transition-all border text-left group ${
                        isSelected
                          ? 'bg-gradient-to-r from-amber-400/20 to-amber-500/20 border-amber-400/50'
                          : isDisabled
                            ? 'bg-acai-dark border-gray-700/30 opacity-40 cursor-not-allowed'
                            : 'bg-acai-raised border-purple-800/30 hover:border-purple-700/50'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        isSelected
                          ? 'bg-amber-400 border-amber-400 shadow-lg shadow-amber-500/30'
                          : isDisabled ? 'border-gray-600' : 'border-gray-600 group-hover:border-gray-500'
                      }`}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-sm font-medium leading-snug ${isSelected ? 'text-amber-100' : 'text-gray-300'}`}>
                        {topping.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </section>}

          {/* ── Passo 4: Adicionais Extras (se houver) ────────── */}
          {hasToppings && extras.length > 0 && (
            <section>
              <StepHeader
                number={caldas.length > 0 ? 4 : 3}  /* hasToppings já garante que este bloco renderiza */
                title="Adicionais Extras"
                subtitle="Múltipla escolha · Valores adicionais"
              />

              <div className="space-y-2.5">
                {extras.map(extra => {
                  const isSelected = selectedExtras.some(e => e.key === extra.key)
                  return (
                    <button
                      key={extra.key}
                      onClick={() => toggleExtra(extra)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all border text-left group ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#DB2777]/20 to-[#DB2777]/10 border-acai-accent/50 shadow-lg shadow-acai-accent/20'
                          : 'bg-acai-raised border-purple-800/30 hover:border-purple-700/50'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-acai-accent to-acai-accent-lt border-acai-accent shadow-lg shadow-acai-accent/40'
                          : 'border-gray-600 group-hover:border-gray-500'
                      }`}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <p className={`font-semibold text-sm ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                          {extra.label}
                        </p>
                      </div>
                      <span className={`font-bold text-sm flex-shrink-0 ${isSelected ? 'text-[#DB2777]' : 'text-acai-accent/70'}`}>
                        + {fmt(extra.price)}
                      </span>
                    </button>
                  )
                })}
              </div>
            </section>
          )}

          <div className="h-2" />
        </div>

        {/* ── Rodapé fixo ─────────────────────────────────────── */}
        <div className="px-5 pt-4 pb-8 border-t border-white/5 flex-shrink-0 bg-acai-surface space-y-3">

          {(caldaTotal > 0 || extrasTotal > 0) && (
            <div className="bg-amber-400/10 border border-amber-400/25 rounded-2xl px-4 py-3 text-center">
              <p className="text-xs text-amber-300 leading-relaxed">
                Base {fmt(basePrice)}
                {caldaTotal > 0 && <span> + caldas {fmt(caldaTotal)}</span>}
                {extrasTotal > 0 && <span> + {selectedExtras.length} extra(s) {fmt(extrasTotal)}</span>}
                {' = '}<span className="font-bold text-amber-100">{fmt(unitPrice)}</span> por unidade
              </p>
            </div>
          )}

          {/* Quantidade */}
          <div className="flex items-center justify-between bg-acai-raised rounded-2xl px-4 py-3 border border-purple-800/20">
            <span className="text-sm text-gray-400 font-medium">Quantidade</span>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQty(q => Math.max(1, q - 1))}
                className="w-9 h-9 rounded-full bg-acai-dark flex items-center justify-center text-lg
                           text-gray-400 active:scale-90 transition-transform hover:bg-acai-surface"
              >
                −
              </button>
              <span className="font-bold text-xl w-6 text-center text-white">{qty}</span>
              <button
                onClick={() => setQty(q => q + 1)}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center
                           text-white text-lg active:scale-90 transition-transform shadow-lg shadow-amber-500/40"
              >
                +
              </button>
            </div>
          </div>

          <button
            onClick={handleAdd}
            disabled={!canAdd}
            className={`w-full py-4 rounded-2xl font-bold text-[15px] flex items-center justify-between px-6
                        transition-all active:scale-[0.98] shadow-lg ${
              canAdd
                ? 'bg-gradient-to-r from-acai-accent to-acai-accent-lt text-white shadow-acai-accent/40'
                : 'bg-acai-raised text-gray-600 cursor-not-allowed opacity-50'
            }`}
          >
            <span>{canAdd ? 'Adicionar ao Carrinho' : 'Escolha a massa primeiro'}</span>
            {canAdd && (
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

function StepBadge({ number, amber }) {
  return (
    <div className={`w-8 h-8 rounded-full text-white text-sm font-bold flex items-center justify-center flex-shrink-0 shadow-lg ${
      amber
        ? 'bg-gradient-to-br from-amber-400 to-amber-500 shadow-amber-500/40'
        : 'bg-gradient-to-br from-gray-600 to-gray-700'
    }`}>
      {number}
    </div>
  )
}

function StepHeader({ number, title, subtitle, amber }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <StepBadge number={number} amber={amber} />
      <div className="flex-1">
        <p className="text-base font-bold text-white">{title}</p>
        <p className={`text-xs mt-0.5 ${amber ? 'text-amber-400' : 'text-gray-500'}`}>{subtitle}</p>
      </div>
    </div>
  )
}
