import React from 'react'

const fmt = (v) => `R$ ${Number(v || 0).toFixed(2).replace('.', ',')}`

function CartItem({ item, onUpdateQty, onRemove }) {
  const qty = item.qty || 1

  return (
    <div className="flex items-start gap-3 py-4 border-b border-gray-200 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-gray-900 leading-snug">{item.name}</p>

        {item.type === 'acai' && (
          <div className="mt-1 space-y-0.5">
            {item.base && (
              <p className="text-xs text-gray-500 leading-relaxed">🍧 {item.base.label}</p>
            )}
            {item.caldas?.length > 0 && (
              <p className="text-xs text-gray-500 leading-relaxed">
                🍯 {item.caldas.map(c => c.label).join(', ')}
              </p>
            )}
            {item.toppings?.length > 0 && (
              <p className="text-xs text-gray-400 leading-relaxed">
                + {item.toppings.map(t => t.label).join(', ')}
              </p>
            )}
            {item.extras?.length > 0 && (
              <p className="text-xs text-gray-400 leading-relaxed">
                ✨ {item.extras.map(e => e.label).join(', ')}
              </p>
            )}
          </div>
        )}

        {item.type === 'flavored' && item.flavors?.length > 0 && (
          <div className="mt-1">
            <p className="text-xs text-gray-500 leading-relaxed">
              {item.flavors.filter(f => f.qty > 0).map(f => `${f.qty}× ${f.name}`).join(', ')}
            </p>
          </div>
        )}

        <p className="text-gray-900 font-semibold mt-2 text-sm">{fmt(item.price * qty)}</p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
        <button
          onClick={() => onRemove(item.cartId)}
          className="w-8 h-8 rounded-full flex items-center justify-center
                     active:scale-90 transition-transform text-red-400 hover:text-red-600"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
          </svg>
        </button>

        <div className="flex items-center gap-2 bg-gray-100 rounded-full px-1 py-1">
          <button
            onClick={() => onUpdateQty(item.cartId, -1)}
            className="w-7 h-7 rounded-full flex items-center justify-center text-base
                       active:scale-90 transition-transform text-gray-600 hover:text-gray-900"
          >
            −
          </button>
          <span className="text-sm font-semibold text-gray-900 w-4 text-center">{qty}</span>
          <button
            onClick={() => onUpdateQty(item.cartId, 1)}
            className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center text-base
                       text-white font-bold active:scale-90 transition-transform"
          >
            +
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CartBottomSheet({ open, cart, total, onClose, onRemove, onUpdateQty, onCheckout }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-t-3xl max-h-[85vh] flex flex-col animate-slideUp shadow-xl">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 pt-2 pb-4 border-b border-gray-200 flex-shrink-0 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Seu Carrinho</h2>
          <button
            onClick={onClose}
            className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors px-1"
          >
            Fechar
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 px-5">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-5 border border-gray-200">
              <span className="text-4xl">🍧</span>
            </div>
            <p className="text-gray-900 font-semibold">Carrinho vazio</p>
            <p className="text-gray-500 text-sm mt-1 text-center">Monte seu açaí e adicione ao carrinho.</p>
            <button
              onClick={onClose}
              className="mt-6 px-6 py-2.5 bg-gray-900 rounded-full text-sm font-semibold
                         text-white active:scale-95 transition-transform"
            >
              Ver cardápio
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5">
              {cart.map(item => (
                <CartItem
                  key={item.cartId}
                  item={item}
                  onRemove={onRemove}
                  onUpdateQty={onUpdateQty}
                />
              ))}
            </div>

            <div className="px-5 pt-4 pb-8 border-t border-gray-200 flex-shrink-0 bg-white">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-500 font-medium text-sm">Total do pedido</span>
                <span className="text-2xl font-bold text-gray-900">{fmt(total)}</span>
              </div>
              <button
                onClick={onCheckout}
                className="w-full py-4 bg-emerald-600 rounded-2xl font-semibold text-[15px]
                           text-white active:scale-[0.98] transition-all
                           flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Finalizar Pedido</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
