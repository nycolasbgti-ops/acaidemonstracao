import React, { useEffect, useRef } from 'react'
import { fmt, getBasePrice } from '../utils/price'
import ImageWithFallback from './ImageWithFallback'

export default function Menu({ categories, byCategory, onSelectProduct, onCategoryChange }) {
  const sectionRefs         = useRef({})
  const onCategoryChangeRef = useRef(onCategoryChange)

  useEffect(() => { onCategoryChangeRef.current = onCategoryChange })

  useEffect(() => {
    if (!categories.length) return

    const visible = new Set()

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) visible.add(e.target.dataset.catId)
          else                   visible.delete(e.target.dataset.catId)
        })

        for (const cat of categories) {
          if (visible.has(cat.id)) {
            onCategoryChangeRef.current?.(cat.id)
            break
          }
        }
      },
      {
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
            className={`${idx === 0 ? 'pt-4' : 'pt-8'}`}
          >
            {/* Cabeçalho da categoria */}
            <div className="max-w-6xl mx-auto px-4 mb-5">
              <div className="flex items-center gap-3">
                {cat.icon && (cat.icon.startsWith('http') || cat.icon.startsWith('/'))
                  ? <img src={cat.icon} alt={cat.name} className="w-7 h-7 object-contain flex-shrink-0" />
                  : <span className="text-2xl leading-none">{cat.icon}</span>
                }
                <h2 className="font-bold text-acai-text text-base tracking-widest uppercase">
                  {cat.name}
                </h2>
                <div className="flex-1 h-px bg-gradient-to-r from-acai-primary/40 to-transparent ml-1" />
              </div>
            </div>

            {/* Grid de produtos - Centralizado com max-width */}
            <div className="max-w-6xl mx-auto px-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                {products.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={() => onSelectProduct(product)}
                  />
                ))}
              </div>
            </div>
          </section>
        )
      })}
    </div>
  )
}

function ProductCard({ product, onClick }) {
  const basePrice = getBasePrice(product.prices)

  return (
    <button
      onClick={onClick}
      className="flex flex-col h-full bg-[#1A0B2E] rounded-2xl overflow-hidden
                 active:scale-[0.96] transition-all duration-150 text-left
                 border border-white/5 hover:border-lime-400/30 group
                 hover:shadow-lg hover:shadow-lime-400/10"
    >
      {/* Imagem com aspect ratio 1:1 compacto */}
      <div className="w-full aspect-square bg-gradient-to-br from-acai-primary/20 to-acai-accent/10
                      flex items-center justify-center overflow-hidden relative flex-shrink-0">
        <ImageWithFallback
          src={product.image_url || ''}
          alt={product.name}
          className="w-full h-full"
        />
        <div className="absolute inset-0 bg-black/0 group-active:bg-black/20 transition-all" />
      </div>

      {/* Conteúdo - Compacto e elegante */}
      <div className="flex-1 flex flex-col p-3 md:p-3.5">
        {/* Título */}
        <h3 className="font-semibold text-acai-text text-sm leading-snug line-clamp-2 mb-1">
          {product.name}
        </h3>

        {/* Descrição */}
        <p className="text-xs text-gray-300 line-clamp-2 flex-1 mb-2">
          {product.description}
        </p>

        {/* Rodapé: Preço e Botão */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          {/* Preço - Verde suave ou dourado elegante */}
          <span className="text-lime-400 font-bold text-sm leading-none">
            {fmt(basePrice)}
          </span>

          {/* Botão + Compacto */}
          <button
            onClick={(e) => { e.stopPropagation(); onClick() }}
            className="w-7 h-7 bg-lime-400 hover:bg-lime-500 rounded-lg flex items-center justify-center
                       text-black text-base leading-none shadow-md shadow-lime-400/30
                       font-semibold active:scale-90 transition-all flex-shrink-0
                       hover:shadow-lg hover:shadow-lime-400/50"
          >
            +
          </button>
        </div>
      </div>
    </button>
  )
}
