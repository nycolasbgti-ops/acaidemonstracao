import React from 'react'
import { fmt, getBasePrice } from '../utils/price'

export default function ProductCard({ product, isBuilder, onClick }) {
  const basePrice = getBasePrice(product.prices)

  return (
    <button
      onClick={onClick}
      className="w-full bg-acai-surface rounded-2xl overflow-hidden flex flex-col text-left
                 active:scale-[0.97] transition-all duration-150
                 border border-white/5 hover:border-purple-800/30"
    >
      {/* Image */}
      <div className="w-full aspect-square bg-gradient-to-br from-acai-primary/20 via-acai-accent/10 to-acai-primary/20
                      flex items-center justify-center">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <span className="text-[44px]">{product.emoji ?? '🍧'}</span>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        <h3 className="font-bold text-[13px] text-white leading-snug line-clamp-1">
          {product.name}
        </h3>
        <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2 leading-relaxed flex-1">
          {product.description}
        </p>
        <div className="mt-2.5 flex items-center justify-between">
          <span className="text-[#A78BFA] font-bold text-sm">
            {fmt(basePrice)}
          </span>
          <span
            className="w-7 h-7 bg-gradient-to-r from-acai-accent to-acai-accent-lt rounded-full flex items-center justify-center
                       text-white text-xl leading-none font-light"
            style={{ boxShadow: '0 3px 12px rgba(219,39,119,.35)' }}
          >
            +
          </span>
        </div>
      </div>
    </button>
  )
}
