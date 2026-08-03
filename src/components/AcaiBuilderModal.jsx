import React, { useState } from 'react'
import { fmt, getBasePrice } from '../utils/price'

export default function AcaiBuilderModal({ product, addons = {}, onClose, onAdd }) {
  const config       = product.builder_config || {}
  const hasToppings  = config.has_toppings ?? true
  const allowedBases = config.allowed_bases  || []

  const globalBases = addons.massa          || []
  const caldas      = addons.calda          || []
  const toppings    = addons.acompanhamento || []
  const extras      = addons.extra          || []

  const bases = allowedBases.length > 0
    ? allowedBases.map(name => ({ key: name, label: name, price: 0 }))
    : globalBases

  const [selectedBase,     setSelectedBase]     = useState(null)
  const [selectedCaldas,   setSelectedCaldas]   = useState([])
  const [selectedToppings, setSelectedToppings] = useState([])
  const [selectedExtras,   setSelectedExtras]   = useState([])
  const [qty,              setQty]              = useState(1)

  const basePrice   = getBasePrice(product.prices)
  const caldaTotal  = selectedCaldas.reduce((s, c) => s + c.price, 0)
  const extrasTotal = selectedExtras.reduce((s, e) => s + e.price, 0)
  const unitPrice   = basePrice + caldaTotal + extrasTotal
  const total       = unitPrice * qty

  const freeToppingsLimit = product.free_toppings ?? 4
  const isUnlimited       = freeToppingsLimit === -1
  const atLimit           = !isUnlimited && selectedToppings.length >= freeToppingsLimit

  const toggleCalda = (calda) => {
    setSelectedCaldas(prev =>
      prev.some(c => c.key === calda.key) ? prev.filter(c => c.key !== calda.key) : [...prev, calda]
    )
  }

  const toggleTopping = (topping) => {
    setSelectedToppings(prev => {
      if (prev.some(t => t.key === topping.key)) return prev.filter(t => t.key !== topping.key)
      if (!isUnlimited && prev.length >= freeToppingsLimit) return prev
      return [...prev, topping]
    })
  }

  const toggleExtra = (extra) => {
    setSelectedExtras(prev =>
      prev.some(e => e.key === extra.key) ? prev.filter(e => e.key !== extra.key) : [...prev, extra]
    )
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

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm animate-fadeIn" onClick={onClose} />

      <div className="relative bg-zinc-900 rounded-t-3xl max-h-[92vh] flex flex-col animate-slideUp">

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-0 flex-shrink-0">
          <div className="w-10 h-1 bg-white/15 rounded-full" />
        </div>

        {/* Cabeçalho */}
        <div className="px-5 pt-3 pb-4 border-b border-white/[0.07] flex-shrink-0 flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-[17px] font-semibold text-white leading-snug">{product.name}</h2>
            <p className="text-sm text-zinc-400 mt-0.5">{fmt(basePrice)}</p>
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

        {/* Corpo rolável */}
        <div className="overflow-y-auto flex-1">

          {/* ── Massa ── */}
          <SectionHeader title="Escolha a Massa" badge="Obrigatório" sub="Seleção única" />
          {bases.length === 0 ? (
            <p className="px-5 py-3 text-xs text-zinc-500">
              Nenhuma massa cadastrada. Adicione no painel admin → Adicionais.
            </p>
          ) : (
            <div>
              {bases.map((base, i) => (
                <RowRadio
                  key={base.key}
                  label={base.label}
                  sub={base.description}
                  isSelected={selectedBase?.key === base.key}
                  isLast={i === bases.length - 1}
                  onClick={() => setSelectedBase(base)}
                />
              ))}
            </div>
          )}

          {/* ── Caldas ── */}
          {hasToppings && caldas.length > 0 && (
            <>
              <SectionHeader title="Caldas" badge="Opcional" sub="Múltipla escolha" />
              <div>
                {caldas.map((calda, i) => (
                  <RowCheck
                    key={calda.key}
                    label={calda.label}
                    price={calda.price}
                    isSelected={selectedCaldas.some(c => c.key === calda.key)}
                    isLast={i === caldas.length - 1}
                    onClick={() => toggleCalda(calda)}
                  />
                ))}
              </div>
            </>
          )}

          {/* ── Acompanhamentos ── */}
          {hasToppings && (
            <>
              <SectionHeader
                title="Acompanhamentos"
                badge={isUnlimited ? 'À vontade' : `${selectedToppings.length} / ${freeToppingsLimit}`}
                badgeActive={atLimit}
                sub="Múltipla escolha"
              />

              {atLimit && (
                <div className="mx-5 mb-3 px-4 py-3 bg-white/[0.04] rounded-xl">
                  <p className="text-xs text-zinc-400">Limite de {freeToppingsLimit} acompanhamentos atingido.</p>
                </div>
              )}

              {toppings.length === 0 ? (
                <p className="px-5 py-3 text-xs text-zinc-500">Nenhum acompanhamento cadastrado.</p>
              ) : (
                <div>
                  {toppings.map((topping, i) => {
                    const isSel = selectedToppings.some(t => t.key === topping.key)
                    return (
                      <RowCheck
                        key={topping.key}
                        label={topping.label}
                        isSelected={isSel}
                        isDisabled={!isSel && atLimit}
                        isLast={i === toppings.length - 1}
                        onClick={() => toggleTopping(topping)}
                      />
                    )
                  })}
                </div>
              )}
            </>
          )}

          {/* ── Adicionais Extras ── */}
          {hasToppings && extras.length > 0 && (
            <>
              <SectionHeader title="Adicionais" badge="Com custo" sub="Múltipla escolha" />
              <div>
                {extras.map((extra, i) => (
                  <RowCheck
                    key={extra.key}
                    label={extra.label}
                    price={extra.price}
                    isSelected={selectedExtras.some(e => e.key === extra.key)}
                    isLast={i === extras.length - 1}
                    onClick={() => toggleExtra(extra)}
                  />
                ))}
              </div>
            </>
          )}

          <div className="h-4" />
        </div>

        {/* ── Rodapé fixo ── */}
        <div className="border-t border-white/[0.08] bg-zinc-900 px-5 pt-4 pb-8 flex-shrink-0 space-y-3">

          {(caldaTotal > 0 || extrasTotal > 0) && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-zinc-500">{fmt(basePrice)}</span>
              {caldaTotal > 0 && <>
                <span className="text-zinc-600 text-xs">+</span>
                <span className="text-xs text-zinc-500">{fmt(caldaTotal)} caldas</span>
              </>}
              {extrasTotal > 0 && <>
                <span className="text-zinc-600 text-xs">+</span>
                <span className="text-xs text-zinc-500">{fmt(extrasTotal)} extras</span>
              </>}
              <span className="text-zinc-600 text-xs">=</span>
              <span className="text-xs text-white font-semibold">{fmt(unitPrice)}/un.</span>
            </div>
          )}

          <div className="flex items-center gap-3">
            {/* Controle de quantidade */}
            <div className="flex items-center gap-3 bg-zinc-800 rounded-2xl px-3 py-2.5">
              <button
                onClick={() => setQty(q => Math.max(1, q - 1))}
                className="w-7 h-7 rounded-full border border-white/[0.12] flex items-center justify-center
                           text-zinc-300 text-lg font-light active:scale-90 transition-transform
                           hover:border-white/20 hover:text-white"
              >
                −
              </button>
              <span className="text-base font-semibold text-white w-4 text-center tabular-nums">{qty}</span>
              <button
                onClick={() => setQty(q => q + 1)}
                className="w-7 h-7 rounded-full border border-white/[0.12] flex items-center justify-center
                           text-zinc-300 text-lg font-light active:scale-90 transition-transform
                           hover:border-white/20 hover:text-white"
              >
                +
              </button>
            </div>

            {/* Botão de adicionar */}
            <button
              onClick={handleAdd}
              disabled={!canAdd}
              className={`flex-1 py-3.5 rounded-2xl font-semibold text-[15px] flex items-center justify-between px-5
                          transition-all active:scale-[0.98] ${
                canAdd
                  ? 'bg-white text-zinc-900'
                  : 'bg-white/[0.07] text-zinc-600 cursor-not-allowed'
              }`}
            >
              <span>{canAdd ? 'Adicionar' : 'Escolha a massa'}</span>
              {canAdd && <span className="font-bold">{fmt(total)}</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function SectionHeader({ title, badge, badgeActive, sub }) {
  return (
    <div className="px-5 pt-6 pb-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[15px] font-semibold text-white leading-none">{title}</h3>
        <span className={`text-[11px] font-medium rounded px-2 py-0.5 flex-shrink-0 ${
          badgeActive ? 'bg-white/10 text-white' : 'bg-zinc-800 text-zinc-400'
        }`}>
          {badge}
        </span>
      </div>
      {sub && <p className="text-[12px] text-zinc-500 mt-1">{sub}</p>}
    </div>
  )
}

function RowRadio({ label, sub, isSelected, isLast, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-5 py-4 text-left gap-3
                  hover:bg-white/[0.025] active:bg-white/[0.04] transition-colors
                  ${!isLast ? 'border-b border-white/[0.05]' : ''}`}
    >
      <div className="flex-1 min-w-0">
        <span className={`text-[15px] leading-snug ${isSelected ? 'text-white font-medium' : 'text-zinc-200'}`}>
          {label}
        </span>
        {sub && <p className="text-[12px] text-zinc-500 mt-0.5 truncate">{sub}</p>}
      </div>
      {/* Radio */}
      <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
        isSelected ? 'border-white' : 'border-zinc-600'
      }`}>
        {isSelected && <div className="w-[9px] h-[9px] rounded-full bg-white" />}
      </div>
    </button>
  )
}

function RowCheck({ label, price, isSelected, isDisabled, isLast, onClick }) {
  return (
    <button
      onClick={!isDisabled ? onClick : undefined}
      className={`w-full flex items-center justify-between px-5 py-4 text-left gap-3
                  transition-colors
                  ${!isLast ? 'border-b border-white/[0.05]' : ''}
                  ${isDisabled ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/[0.025] active:bg-white/[0.04]'}`}
    >
      <span className={`flex-1 text-[15px] leading-snug ${isSelected ? 'text-white font-medium' : 'text-zinc-200'}`}>
        {label}
      </span>
      <div className="flex items-center gap-2.5 flex-shrink-0">
        {price > 0 && (
          <span className={`text-[13px] ${isSelected ? 'text-zinc-300' : 'text-zinc-500'}`}>
            + {fmt(price)}
          </span>
        )}
        {/* Checkbox */}
        <div className={`w-5 h-5 rounded-[5px] border-2 flex items-center justify-center transition-all ${
          isSelected ? 'border-white bg-white' : 'border-zinc-600'
        }`}>
          {isSelected && (
            <svg className="w-[11px] h-[11px] text-zinc-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
    </button>
  )
}
