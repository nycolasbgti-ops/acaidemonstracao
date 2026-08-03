import React, { useState } from 'react'

export default function ImageWithFallback({ src, alt = 'Produto', emoji = '🍧', className = '' }) {
  const [isLoading, setIsLoading] = useState(!!src)
  const [hasError,  setHasError]  = useState(false)

  if (!src || hasError) {
    return (
      <div className={`w-full h-full bg-gradient-to-br from-zinc-800 via-zinc-850 to-zinc-900 flex items-center justify-center ${className}`}>
        <span className="text-5xl select-none opacity-80">{emoji}</span>
      </div>
    )
  }

  return (
    <div className={`w-full h-full overflow-hidden relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 animate-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        onLoad={() => setIsLoading(false)}
        onError={() => { setIsLoading(false); setHasError(true) }}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
  )
}
