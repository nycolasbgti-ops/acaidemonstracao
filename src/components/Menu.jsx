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
            className={`${idx === 0 ? 'pt-5' : 'pt-9'}`}
          >
            {/* Cabeçalho da categoria */}
            <div className="max-w-6xl mx-auto px-4 mb-4">
              <div className="flex items-center gap-2.5">
                {cat.icon && (cat.icon.startsWith('http') || cat.icon.startsWith('/'))
                  ? <img src={cat.icon} alt={cat.name} className="w-5 h-5 object-contain flex-shrink-0 opacity-80" />
                  : <span className="text-xl leading-none">{cat.icon}</span>
                }
                <h2 className="font-semibold text-white/80 text-sm tracking-normal">
                  {cat.name}
                </h2>
                <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent ml-1" />
              </div>
            </div>

            {/* Grid de produtos */}
            <div className="max-w-6xl mx-auto px-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
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
      className="flex flex-col h-full bg-zinc-900 rounded-2xl overflow-hidden
                 active:scale-[0.97] transition-all duration-150 text-left
                 border border-white/5 hover:border-white/10 group"
    >
      {/* Imagem */}
      <div className="w-full aspect-square overflow-hidden relative flex-shrink-0">
        <ImageWithFallback
          src={product.image_url || ''}
          alt={product.name}
          emoji={product.emoji ?? '🍧'}
          className="w-full h-full"
        />
        <div className="absolute inset-0 bg-black/0 group-active:bg-black/15 transition-all" />
      </div>

      {/* Conteúdo */}
      <div className="flex-1 flex flex-col p-3">
        <h3 className="font-semibold text-white text-[13px] leading-snug line-clamp-2 mb-1">
          {product.name}
        </h3>

        <p className="text-[11px] text-zinc-400 line-clamp-2 flex-1 mb-2.5 leading-relaxed">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-violet-300 font-semibold text-sm leading-none">
            {fmt(basePrice)}
          </span>

          <span
            className="w-7 h-7 rounded-full bg-white/5 border border-white/12
                       flex items-center justify-center text-white/50 text-[18px]
                       leading-none font-light group-hover:border-white/20
                       group-hover:text-white/70 transition-all flex-shrink-0"
          >
            +
          </span>
        </div>
      </div>
    </button>
  )
}
