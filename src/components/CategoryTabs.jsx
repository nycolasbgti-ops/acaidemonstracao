import React, { useRef, useEffect } from 'react'

function CategoryIcon({ icon, name }) {
  const isUrl = icon && (icon.startsWith('http') || icon.startsWith('/'))
  if (isUrl) {
    return (
      <img
        src={icon}
        alt={name}
        className="w-5 h-5 object-contain flex-shrink-0"
      />
    )
  }
  return <span className="text-lg leading-none">{icon}</span>
}

export default function CategoryTabs({ categories, selected, onChange }) {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!selected || !containerRef.current) return
    const btn = containerRef.current.querySelector(`[data-cat-btn="${selected}"]`)
    btn?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [selected])

  return (
    <div className="sticky top-16 z-30 bg-gradient-to-b from-acai-bg to-acai-surface border-b border-acai-border py-2.5">
      <div ref={containerRef} className="flex gap-2 overflow-x-auto px-4 max-w-6xl mx-auto scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat.id}
            data-cat-btn={cat.id}
            onClick={() => onChange(cat.id)}
            className={`
              flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full
              text-xs font-medium transition-all duration-200 active:scale-95 whitespace-nowrap
              ${selected === cat.id
                ? 'bg-lime-400/15 text-lime-400 border border-lime-400/40 shadow-md shadow-lime-400/20'
                : 'bg-acai-surface/60 text-acai-text-muted border border-acai-border hover:border-lime-400/20 hover:text-acai-text hover:bg-acai-surface'}
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
