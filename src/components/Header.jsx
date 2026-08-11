import React from 'react'

const fmt = (v) => `R$ ${Number(v || 0).toFixed(2).replace('.', ',')}`

export default function Header({ cartCount, cartTotal, onCartClick, onInfoClick }) {
  return (
    <header className="sticky top-0 z-40 bg-zinc-950 border-b border-zinc-800 shadow-sm">
      <div className="max-w-lg mx-auto px-4 h-28 flex items-center justify-between">

        {/* Logo — esquerda */}
        <div className="flex items-center flex-1">
          <img src="/logo.png" alt="Luma Açaí" className="h-24 sm:h-28 w-auto object-contain" />
        </div>

        {/* Ações — direita */}
        <div className="flex items-center gap-2">
          {/* Ícone de info da loja */}
          <button
            onClick={onInfoClick}
            className="w-9 h-9 flex items-center justify-center bg-zinc-800 rounded-full
                       border border-zinc-700 text-gray-400 transition-all active:scale-95
                       hover:text-white hover:bg-zinc-700"
            aria-label="Informações da loja"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          {/* Carrinho */}
          {cartCount > 0 ? (
            <button
              onClick={onCartClick}
              className="flex items-center gap-2 bg-purple-900 text-white px-3.5 py-2 rounded-full
                         active:scale-95 transition-all text-sm font-semibold hover:bg-purple-800"
            >
              <span className="text-xs font-bold bg-white/20 rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
              <span className="text-xs font-bold">{fmt(cartTotal)}</span>
            </button>
          ) : (
            <button
              onClick={onCartClick}
              className="w-9 h-9 flex items-center justify-center bg-zinc-800 rounded-full
                         border border-zinc-700 text-gray-400 transition-all active:scale-95
                         hover:text-white hover:bg-zinc-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
