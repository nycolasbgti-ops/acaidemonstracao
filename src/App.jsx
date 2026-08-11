import React, { useState, useCallback, useEffect, useRef } from 'react'
import { useMenu } from './hooks/useMenu'
import Header from './components/Header'
import CategoryTabs from './components/CategoryTabs'
import Menu from './components/Menu'
import AcaiBuilderModal from './components/AcaiBuilderModal'
import FlavorPickerModal from './components/FlavorPickerModal'
import CartBottomSheet from './components/CartBottomSheet'
import CheckoutView from './components/CheckoutView'
import ConfirmationView from './components/ConfirmationView'
import BottomNav from './components/BottomNav'
import StoreInfoModal from './components/StoreInfoModal'
import OrdersView from './components/OrdersView'
import AdminLogin from './components/admin/AdminLogin'
import AdminPanel from './components/admin/AdminPanel'

export default function App() {
  const { categories, byCategory, addons, bannerUrl, loading, error } = useMenu()

  const [view,           setView]          = useState('menu')
  const [cart,           setCart]          = useState([])
  const [activeCatId,    setActiveCatId]   = useState(null)
  const [builder,        setBuilder]       = useState({ open: false, product: null })
  const [flavorPicker,   setFlavorPicker]  = useState({ open: false, product: null })
  const [cartOpen,       setCartOpen]      = useState(false)
  const [confirmedOrder, setConfirmedOrder] = useState(null)
  const [showAdminLogin, setAdminLogin]    = useState(false)
  const [showStoreInfo,  setShowStoreInfo] = useState(false)
  const [navTab,         setNavTab]        = useState('home')

  // Refs para scroll spy
  const stickyHeaderRef        = useRef(null)
  const isScrollingToSection   = useRef(false)
  const scrollTimeoutRef       = useRef(null)

  // Link secreto: ?admin na URL abre o login por PIN
  useEffect(() => {
    if (window.location.search.includes('admin')) setAdminLogin(true)
  }, [])

  // Seleciona a primeira categoria quando os dados chegam
  useEffect(() => {
    if (categories.length > 0 && !activeCatId) {
      setActiveCatId(categories[0].id)
    }
  }, [categories, activeCatId])

  // ── Scroll Spy — callback chamado pelo IntersectionObserver em Menu.jsx ──
  // O lock impede que o observer "brigue" com a rolagem acionada pelo clique no tab
  const handleCategoryChange = useCallback((catId) => {
    if (isScrollingToSection.current) return
    setActiveCatId(catId)
  }, [])

  // ── Clique em tab → rola para a seção ────────────────────────
  const handleTabChange = useCallback((catId) => {
    isScrollingToSection.current = true
    setActiveCatId(catId)

    const section = document.querySelector(`[data-cat-id="${catId}"]`)
    if (section) {
      const headerHeight = stickyHeaderRef.current?.offsetHeight || 0
      const top = section.getBoundingClientRect().top + window.scrollY - headerHeight - 8
      window.scrollTo({ top, behavior: 'smooth' })
    }

    clearTimeout(scrollTimeoutRef.current)
    scrollTimeoutRef.current = setTimeout(() => {
      isScrollingToSection.current = false
    }, 1200)
  }, [])

  // ── Cart ─────────────────────────────────────────────────────
  const addToCart = useCallback((item) => {
    setCart(prev => {
      if (item.type === 'acai' || item.type === 'flavored') {
        return [...prev, { ...item, cartId: Date.now() + Math.random() }]
      }
      const existing = prev.find(i => i.id === item.id)
      if (existing) {
        return prev.map(i => i.cartId === existing.cartId ? { ...i, qty: (i.qty || 1) + 1 } : i)
      }
      return [...prev, { ...item, cartId: Date.now() + Math.random(), qty: 1 }]
    })
    setNavTab('home')
  }, [])

  const updateQty = useCallback((cartId, delta) => {
    setCart(prev =>
      prev
        .map(i => i.cartId === cartId ? { ...i, qty: (i.qty || 1) + delta } : i)
        .filter(i => (i.qty || 1) > 0)
    )
  }, [])

  const removeItem = useCallback((cartId) => {
    setCart(prev => prev.filter(i => i.cartId !== cartId))
  }, [])

  const cartCount = cart.reduce((s, i) => s + (i.qty || 1), 0)
  const cartTotal = cart.reduce((s, i) => s + i.price * (i.qty || 1), 0)

  // ── Clique em produto ─────────────────────────────────────────
  // Verifica is_builder pela categoria do próprio produto (não pelo tab ativo)
  const handleProductClick = (product) => {
    const productCat = categories.find(c => c.id === product.category_id) ?? null
    if (productCat?.is_builder) {
      setBuilder({ open: true, product })
    } else if (product.flavors?.length > 0) {
      setFlavorPicker({ open: true, product })
    } else {
      const price = Number(product.prices?.unique ?? product.price ?? 0)
      addToCart({ ...product, type: 'other', price, qty: 1 })
    }
  }

  const handleAdminLogout = () => {
    setView('menu')
  }

  const handleOrderConfirmed = (order) => {
    setConfirmedOrder(order)
    setCart([])
    setCartOpen(false)
    setView('confirmation')
  }

  // ── Views ─────────────────────────────────────────────────────
  if (view === 'admin') return <AdminPanel onLogout={handleAdminLogout} />
  if (view === 'checkout') {
    return <CheckoutView cart={cart} total={cartTotal} onBack={() => setView('menu')} onConfirm={handleOrderConfirmed} />
  }
  if (view === 'confirmation') {
    return <ConfirmationView order={confirmedOrder} onNewOrder={() => { setConfirmedOrder(null); setView('menu'); setNavTab('home') }} />
  }

  const showCategoryTabs = navTab !== 'orders' && !loading && categories.length > 0

  // ── Menu principal ────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div ref={stickyHeaderRef} className="sticky top-0 z-50 flex flex-col bg-zinc-950 pt-[env(safe-area-inset-top)]">
        <Header
          cartCount={cartCount}
          cartTotal={cartTotal}
          onCartClick={() => { setCartOpen(true); setNavTab('cart') }}
          onInfoClick={() => setShowStoreInfo(true)}
        />

        {showCategoryTabs && (
          <CategoryTabs
            categories={categories}
            selected={activeCatId}
            onChange={handleTabChange}
          />
        )}
      </div>

      {navTab === 'orders' ? (
        <OrdersView />
      ) : loading ? (
        <LoadingState />
      ) : categories.length === 0 ? (
        <ErrorState message={error} />
      ) : (
        <main>
          <Menu
            categories={categories}
            byCategory={byCategory}
            bannerUrl={bannerUrl}
            onSelectProduct={handleProductClick}
            onCategoryChange={handleCategoryChange}
          />
        </main>
      )}

      {/* Modal de montagem do açaí */}
      {builder.open && (
        <AcaiBuilderModal
          product={builder.product}
          addons={addons}
          onClose={() => setBuilder({ open: false, product: null })}
          onAdd={(item) => {
            addToCart(item)
            setBuilder({ open: false, product: null })
          }}
        />
      )}

      {/* Modal de sabores (picolés, moreninhas etc.) */}
      {flavorPicker.open && (
        <FlavorPickerModal
          product={flavorPicker.product}
          onClose={() => setFlavorPicker({ open: false, product: null })}
          onAdd={(item) => {
            addToCart(item)
            setFlavorPicker({ open: false, product: null })
          }}
        />
      )}

      <CartBottomSheet
        open={cartOpen}
        cart={cart}
        total={cartTotal}
        onClose={() => setCartOpen(false)}
        onRemove={removeItem}
        onUpdateQty={updateQty}
        onCheckout={() => { setCartOpen(false); setView('checkout') }}
      />

      <BottomNav
        cartCount={cartCount}
        onHomeClick={() => setNavTab('home')}
        onCartClick={() => { setCartOpen(true); setNavTab('cart') }}
        onOrdersClick={() => setNavTab('orders')}
        activeTab={navTab}
      />

      {showStoreInfo && <StoreInfoModal onClose={() => setShowStoreInfo(false)} />}

      {showAdminLogin && (
        <AdminLogin
          onSuccess={() => { setView('admin'); setAdminLogin(false) }}
          onClose={() => setAdminLogin(false)}
        />
      )}
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center pt-24 gap-4">
      <div className="w-10 h-10 border-2 border-purple-700 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-gray-400">Carregando cardápio...</p>
    </div>
  )
}

function ErrorState({ message }) {
  return (
    <div className="px-6 pt-24 text-center">
      <span className="text-5xl block mb-4">⚠️</span>
      <p className="text-white font-semibold mb-2">Não foi possível carregar o cardápio</p>
      {message && (
        <p className="text-gray-400 text-xs font-mono bg-zinc-900 rounded-xl px-4 py-3 mt-3 text-left break-all">
          {message}
        </p>
      )}
    </div>
  )
}
