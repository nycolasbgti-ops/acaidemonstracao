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
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 },
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
            className={idx === 0 ? 'pt-5' : 'pt-8'}
          >
            {/* Cabeçalho da seção */}
            <div className="max-w-lg mx-auto px-4 mb-2">
              <div className="flex items-center gap-2">
                {cat.icon && !cat.icon.startsWith('http')
                  ? <span className="text-sm leading-none">{cat.icon}</span>
                  : <img src={cat.icon} alt={cat.name} className="w-4 h-4 object-contain opacity-60" />
                }
                <h2 className="text-xs font-semibold tracking-widest uppercase text-zinc-500">
                  {cat.name}
                </h2>
              </div>
            </div>

            {/* Lista horizontal */}
            <div className="max-w-lg mx-auto px-4">
              <div className="bg-zinc-900 rounded-2xl overflow-hidden">
                {products.map((product, i) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isLast={i === products.length - 1}
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

function ProductCard({ product, isLast, onClick }) {
  const basePrice = getBasePrice(product.prices)

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-4 text-left
                  active:bg-white/[0.03] transition-colors
                  ${!isLast ? 'border-b border-white/[0.06]' : ''}`}
    >
      {/* Imagem quadrada */}
      <div className="w-[88px] h-[88px] rounded-xl overflow-hidden flex-shrink-0">
        <ImageWithFallback
          src={product.image_url || ''}
          alt={product.name}
          emoji={product.emoji ?? '🍧'}
          className="w-full h-full"
        />
      </div>

      {/* Informações */}
      <div className="flex-1 min-w-0 flex flex-col self-stretch py-0.5">
        <h3 className="text-[15px] font-medium text-white leading-snug line-clamp-1">
          {product.name}
        </h3>
        <p className="text-[13px] text-zinc-400 line-clamp-2 leading-relaxed mt-0.5 flex-1">
          {product.description}
        </p>
        <div className="flex items-center justify-between mt-2.5">
          <span className="text-[15px] font-semibold text-white">
            {fmt(basePrice)}
          </span>
          <div
            className="w-7 h-7 rounded-full border border-white/[0.18] flex items-center justify-center
                       text-white/55 text-[18px] font-light leading-none"
          >
            +
          </div>
        </div>
      </div>
    </button>
  )
}
