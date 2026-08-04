import React from 'react'
import Logo from './Logo'

const fmt = (v) => `R$ ${Number(v || 0).toFixed(2).replace('.', ',')}`

export default function Header({ cartCount, cartTotal, onCartClick, onInfoClick }) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-lg mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo — esquerda */}
        <div className="flex items-center flex-1">
          <Logo className="h-8 sm:h-10 w-auto object-contain" />
        </div>

        {/* Ações — direita */}
        <div className="flex items-center gap-2">
          {/* Ícone de info da loja */}
          <button
            onClick={onInfoClick}
            className="w-9 h-9 flex items-center justify-center bg-gray-100 rounded-full
                       border border-gray-200 text-gray-500 transition-all active:scale-95
                       hover:text-gray-900 hover:bg-gray-200"
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
              className="flex items-center gap-2 bg-gray-900 text-white px-3.5 py-2 rounded-full
                         active:scale-95 transition-all text-sm font-semibold"
            >
              <span className="text-xs font-bold bg-white/20 rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
              <span className="text-xs font-bold">{fmt(cartTotal)}</span>
            </button>
          ) : (
            <button
              onClick={onCartClick}
              className="w-9 h-9 flex items-center justify-center bg-gray-100 rounded-full
                         border border-gray-200 text-gray-500 transition-all active:scale-95
                         hover:text-gray-900 hover:bg-gray-200"
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
