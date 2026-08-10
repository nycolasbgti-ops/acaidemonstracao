import React, { useState } from 'react'

const ACAI_FALLBACK_IMG = 'https://images.unsplash.com/photo-1590137876181-2a5a7e340308?w=500&q=80'

export default function ImageWithFallback({ src, alt = 'Produto', emoji = '🍧', className = '' }) {
  const [isLoading,      setIsLoading]      = useState(!!src)
  const [hasError,       setHasError]       = useState(false)
  const [fallbackFailed, setFallbackFailed] = useState(false)

  if (!src || hasError) {
    if (fallbackFailed) {
      return (
        <div className={`w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center ${className}`}>
          <span className="text-5xl select-none opacity-80">{emoji}</span>
        </div>
      )
    }
    return (
      <div className={`w-full h-full overflow-hidden ${className}`}>
        <img
          src={ACAI_FALLBACK_IMG}
          alt={alt}
          onError={() => setFallbackFailed(true)}
          className="w-full h-full object-cover"
          loading="lazy"
        />
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
