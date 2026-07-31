import React from 'react'

const fmt = (v) => `R$ ${Number(v || 0).toFixed(2).replace('.', ',')}`

// SVG Logo inline - Bowl de açaí genérico
const AcaiLogo = () => (
  <svg width="40" height="40" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-9 h-9">
    {/* Bowl */}
    <path d="M 20 40 L 25 85 L 75 85 L 80 40 Z" fill="#8B4789" stroke="#D4A5D4" strokeWidth="2"/>
    {/* Acai filling */}
    <ellipse cx="50" cy="45" rx="28" ry="12" fill="#9D3F7F"/>
    {/* Shine effect */}
    <ellipse cx="50" cy="42" rx="22" ry="8" fill="#C04FA8" opacity="0.6"/>
    {/* Toppings - granola circles */}
    <circle cx="35" cy="50" r="3" fill="#D4AF37"/>
    <circle cx="55" cy="52" r="2.5" fill="#D4AF37"/>
    <circle cx="65" cy="48" r="3" fill="#D4AF37"/>
    <circle cx="45" cy="55" r="2" fill="#E8C050"/>
  </svg>
)

export default function Header({ cartCount, cartTotal, onCartClick, onInfoClick }) {
  return (
    <header className="sticky top-0 z-40 bg-[#07011A]/95 backdrop-blur-xl border-b border-purple-800/30">
      <div className="max-w-lg mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo — esquerda */}
        <div className="flex items-center gap-2 flex-1">
          <AcaiLogo />
          <span className="font-bold text-white text-base tracking-tight">Açaí Concept</span>
        </div>

        {/* Ações — direita */}
        <div className="flex items-center gap-2">
          {/* Ícone de info da loja */}
          <button
            onClick={onInfoClick}
            className="w-9 h-9 flex items-center justify-center bg-purple-950/60 rounded-full
                       border border-purple-800/40 text-gray-400 transition-all active:scale-95"
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
              className="flex items-center gap-2 bg-[#DB2777] px-3 py-2 rounded-full
                         active:scale-95 transition-all shadow-lg shadow-[#DB2777]/40 text-white text-sm"
            >
              <span className="text-xs font-bold bg-black/20 rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
              <span className="text-xs font-bold">{fmt(cartTotal)}</span>
            </button>
          ) : (
            <button
              onClick={onCartClick}
              className="w-9 h-9 flex items-center justify-center bg-purple-950/60 rounded-full
                         border border-purple-800/40 text-gray-400 transition-all active:scale-95"
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
