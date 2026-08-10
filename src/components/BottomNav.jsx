import React from 'react'

export default function BottomNav({ cartCount, onHomeClick, onCartClick, onOrdersClick, activeTab = 'home' }) {
  const NavItem = ({ id, label, icon, onClick, isActive }) => (
    <button
      onClick={onClick}
      className={`flex-1 flex flex-col items-center justify-center py-3 gap-[5px] transition-colors ${
        isActive ? 'text-white' : 'text-gray-500 hover:text-gray-300'
      }`}
    >
      <div className="relative">
        <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"
             strokeWidth={isActive ? 2 : 1.5}>
          {icon === 'home' && (
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          )}
          {icon === 'cart' && (
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          )}
          {icon === 'orders' && (
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          )}
        </svg>

        {icon === 'cart' && cartCount > 0 && (
          <span className="absolute -top-1.5 -right-2.5 min-w-[17px] h-[17px]
                           bg-purple-900 text-white text-[9px] font-bold rounded-full
                           flex items-center justify-center px-[3px]">
            {cartCount > 9 ? '9+' : cartCount}
          </span>
        )}
      </div>
      <span className="text-[10px] font-medium tracking-wide">{label}</span>
    </button>
  )

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-lg mx-auto
                    bg-zinc-950 border-t border-zinc-800 shadow-md">
      <div className="flex items-center">
        <NavItem id="home"   label="Início"   icon="home"   isActive={activeTab === 'home'}   onClick={onHomeClick} />
        <NavItem id="cart"   label="Carrinho" icon="cart"   isActive={activeTab === 'cart'}   onClick={onCartClick} />
        <NavItem id="orders" label="Pedidos"  icon="orders" isActive={activeTab === 'orders'} onClick={onOrdersClick} />
      </div>
    </nav>
  )
}
