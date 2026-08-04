import React, { useRef, useEffect } from 'react'

function CategoryIcon({ icon, name }) {
  const isUrl = icon && (icon.startsWith('http') || icon.startsWith('/'))
  if (isUrl) {
    return (
      <img
        src={icon}
        alt={name}
        className="w-4 h-4 object-contain flex-shrink-0 opacity-70"
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
    <div className="sticky top-16 z-30 bg-white border-b border-gray-200 py-2.5">
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
                ? 'bg-purple-100 text-purple-700 border border-purple-200'
                : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200 hover:text-gray-900'}
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
