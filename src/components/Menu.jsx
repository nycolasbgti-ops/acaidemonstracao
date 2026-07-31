import React, { useEffect, useRef } from 'react'
import { fmt, getBasePrice } from '../utils/price'

export default function Menu({ categories, byCategory, onSelectProduct, onCategoryChange }) {
  const sectionRefs         = useRef({})
  const onCategoryChangeRef = useRef(onCategoryChange)

  // Mantém o ref atualizado sem recriar o observer a cada render
  useEffect(() => { onCategoryChangeRef.current = onCategoryChange })

  // IntersectionObserver — detecta qual seção está no "terço superior" da tela
  useEffect(() => {
    if (!categories.length) return

    // Rastreia quais seções estão dentro da zona ativa em tempo real
    const visible = new Set()

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) visible.add(e.target.dataset.catId)
          else                   visible.delete(e.target.dataset.catId)
        })

        // Percorre categorias em ordem DOM e reporta a primeira visível (mais ao topo)
        for (const cat of categories) {
          if (visible.has(cat.id)) {
            onCategoryChangeRef.current?.(cat.id)
            break
          }
        }
      },
      {
        // Corta 20% do topo (cobre header + tabs ~120px) e 70% da base
        // → zona ativa ≈ terço superior da viewport, onde o título da seção entra
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0,
      },
    )

    Object.values(sectionRefs.current).forEach(el => { if (el) observer.observe(el) })
    return () => observer.disconnect()
  }, [categories])

  return (
    <div className="pb-32">
      {categories.map((cat, idx) => {
        const products = byCategory[cat.id] ?? []
        if (!products.length) return null

        return (
          <section
            key={cat.id}
            data-cat-id={cat.id}
            ref={el => { sectionRefs.current[cat.id] = el }}
            className={`px-4 ${idx === 0 ? 'pt-4' : 'pt-8'}`}
          >
            {/* Cabeçalho da categoria */}
            <div className="flex items-center gap-2 mb-4">
              {cat.icon && (cat.icon.startsWith('http') || cat.icon.startsWith('/'))
                ? <img src={cat.icon} alt={cat.name} className="w-7 h-7 object-contain flex-shrink-0" />
                : <span className="text-xl leading-none">{cat.icon}</span>
              }
              <h2 className="font-bold text-acai-text text-sm tracking-widest uppercase">
                {cat.name}
              </h2>
              <div className="flex-1 h-px bg-gradient-to-r from-acai-primary/40 to-transparent ml-1" />
            </div>

            {/* Grid de produtos */}
            <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
              {products.map(product => (
                <ProductGridCard
                  key={product.id}
                  product={product}
                  onClick={() => onSelectProduct(product)}
                />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

function ProductGridCard({ product, onClick }) {
  const basePrice = getBasePrice(product.prices)

  return (
    <button
      onClick={onClick}
      className="flex flex-col bg-acai-surface rounded-2xl overflow-hidden
                 active:scale-[0.96] transition-all duration-150 text-left
                 border border-acai-border hover:border-acai-primary/50 group
                 hover:shadow-lg-premium hover:shadow-acai-primary/20"
    >
      {/* Imagem */}
      <div className="w-full aspect-square bg-gradient-to-br from-acai-primary/30 to-acai-accent/10
                      flex items-center justify-center overflow-hidden relative">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-acai-raised">
            <span className="text-4xl opacity-40">{product.emoji ?? '🍧'}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-active:bg-black/20 transition-all" />
      </div>

      {/* Conteúdo */}
      <div className="flex-1 flex flex-col p-3">
        <h3 className="font-bold text-sm text-acai-text leading-snug line-clamp-2 mb-1">
          {product.name}
        </h3>
        <p className="text-xs text-acai-text-muted line-clamp-1 flex-1">
          {product.description}
        </p>

        <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-acai-border">
          <span className="text-acai-gold font-bold text-sm">
            {fmt(basePrice)}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onClick() }}
            className="w-7 h-7 bg-gradient-to-r from-acai-accent to-acai-accent-lt rounded-full flex items-center justify-center
                       text-white text-lg leading-none shadow-lg shadow-acai-accent/40
                       font-light active:scale-90 transition-transform flex-shrink-0
                       hover:shadow-xl hover:shadow-acai-accent/50"
          >
            +
          </button>
        </div>
      </div>
    </button>
  )
}
