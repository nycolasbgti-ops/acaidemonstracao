import React, { useRef, useEffect } from 'react'

function CategoryIcon({ icon, name }) {
  const isUrl = icon && (icon.startsWith('http') || icon.startsWith('/'))
  if (isUrl) {
    return (
      <img
        src={icon}
        alt={name}
        className="w-10 h-10 object-contain -mt-9 mb-1 drop-shadow-md mx-auto"
        onError={e => { e.target.style.display = 'none' }}
      />
    )
  }
  return (
    <div className="w-10 h-10 -mt-9 mb-1 drop-shadow-md mx-auto flex items-center justify-center text-3xl leading-none">
      {icon || '🍧'}
    </div>
  )
}

export default function CategoryTabs({ categories, selected, onChange }) {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!selected || !containerRef.current) return
    const btn = containerRef.current.querySelector(`[data-cat-btn="${selected}"]`)
    btn?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [selected])

  return (
    <div className="sticky top-20 z-30 bg-zinc-900 border-b border-zinc-800">
      <div ref={containerRef} className="flex items-center gap-3 overflow-x-auto py-4 px-2 no-scrollbar justify-start sm:justify-center max-w-lg mx-auto">
        {categories.map(cat => (
          <button
            key={cat.id}
            data-cat-btn={cat.id}
            onClick={() => onChange(cat.id)}
            className="flex flex-col items-center min-w-[90px] pt-4 cursor-pointer relative group"
          >
            <div
              className={`w-full rounded-2xl pt-6 pb-2 px-2 text-center transition-all ${
                selected === cat.id
                  ? 'bg-purple-100 dark:bg-purple-900/40 ring-2 ring-purple-500'
                  : 'bg-gray-100 dark:bg-zinc-800'
              }`}
            >
              <CategoryIcon icon={cat.icon} name={cat.name} />
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 text-center line-clamp-1">
                {cat.name}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
