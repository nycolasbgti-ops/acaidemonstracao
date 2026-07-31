import React from 'react'

export default function BottomNav({ cartCount, onHomeClick, onCartClick, onOrdersClick, activeTab = 'home' }) {
  const NavItem = ({ id, label, icon, onClick, isActive }) => (
    <button
      onClick={onClick}
      className={`flex-1 flex flex-col items-center justify-center py-3 px-2 transition-all ${
        isActive ? 'text-acai-accent' : 'text-acai-text-muted hover:text-acai-text'
      }`}
    >
      <div className="relative flex items-center justify-center mb-1.5">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {icon === 'home' && (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M3 12l2.834-2.834a2 2 0 012.828 0L12 13l3.338-3.338a2 2 0 012.828 0L21 20M3 6h18M3 6v12a2 2 0 002 2h14a2 2 0 002-2V6" />
          )}
          {icon === 'cart' && (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          )}
          {icon === 'orders' && (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          )}
        </svg>
        {icon === 'cart' && cartCount > 0 && (
          <span className="absolute -top-1 -right-2 w-5 h-5 bg-gradient-to-r from-acai-accent to-acai-accent-lt rounded-full text-white
                           text-xs font-bold flex items-center justify-center shadow-lg shadow-acai-accent/40">
            {cartCount > 9 ? '9+' : cartCount}
          </span>
        )}
      </div>
      <span className="text-xs font-medium">{label}</span>
    </button>
  )

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-acai-bg to-acai-surface border-t border-acai-border
                    backdrop-blur-lg z-40 max-w-lg mx-auto shadow-lg shadow-acai-primary/10">
      <div className="flex items-center justify-around">
        <NavItem id="home"   label="Início"   icon="home"   isActive={activeTab === 'home'}   onClick={onHomeClick} />
        <NavItem id="cart"   label="Carrinho" icon="cart"   isActive={activeTab === 'cart'}   onClick={onCartClick} />
        <NavItem id="orders" label="Pedidos"  icon="orders" isActive={activeTab === 'orders'} onClick={onOrdersClick} />
      </div>
    </nav>
  )
}
