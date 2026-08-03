import React, { useRef, useEffect } from 'react'

function CategoryIcon({ icon, name }) {
  const isUrl = icon && (icon.startsWith('http') || icon.startsWith('/'))
  if (isUrl) {
    return (
      <img
        src={icon}
        alt={name}
        className="w-4 h-4 object-contain flex-shrink-0 opacity-80"
      />
    )
  }
  return <span className="text-base leading-none">{icon}</span>
}

export default function CategoryTabs({ categories, selected, onChange }) {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!selected || !containerRef.current) return
    const btn = containerRef.current.querySelector(`[data-cat-btn="${selected}"]`)
    btn?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [selected])

  return (
    <div className="sticky top-16 z-30 bg-acai-bg/95 backdrop-blur-sm border-b border-white/5 py-2.5">
      <div ref={containerRef} className="flex gap-1.5 overflow-x-auto px-4 max-w-6xl mx-auto scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat.id}
            data-cat-btn={cat.id}
            onClick={() => onChange(cat.id)}
            className={`
              flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full
              text-[11px] font-medium transition-all duration-200 active:scale-95 whitespace-nowrap
              ${selected === cat.id
                ? 'bg-violet-500/15 text-violet-200 border border-violet-400/25'
                : 'bg-white/5 text-zinc-400 border border-white/5 hover:border-white/10 hover:text-zinc-200 hover:bg-white/[0.07]'}
            `}
          >
            <CategoryIcon icon={cat.icon} name={cat.name} />
            <span>{cat.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
