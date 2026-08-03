import React, { useState } from 'react'

// SVG Logo de Açaí elegante para fallback
const AcaiFallbackIcon = () => (
  <svg width="64" height="64" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="opacity-70">
    {/* Bowl base - Roxo suave */}
    <path d="M 20 40 L 25 85 L 75 85 L 80 40 Z" fill="currentColor" opacity="0.3"/>
    {/* Açai preenchimento */}
    <ellipse cx="50" cy="45" rx="28" ry="12" fill="currentColor" opacity="0.5"/>
    {/* Shine - Verde menta sutil */}
    <ellipse cx="50" cy="42" rx="22" ry="8" fill="#10B981" opacity="0.3"/>
  </svg>
)

export default function ImageWithFallback({ src, alt = 'Produto', className = '' }) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleImageLoad = () => {
    setIsLoading(false)
    setHasError(false)
  }

  const handleImageError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  if (hasError) {
    return (
      <div className={`w-full h-full bg-gradient-to-br from-acai-dark via-acai-surface to-acai-raised flex items-center justify-center ${className}`}>
        <div className="flex flex-col items-center gap-2 text-acai-text-muted">
          <AcaiFallbackIcon />
          <span className="text-xs font-medium text-center px-2">Imagem indisponível</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`w-full h-full overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-acai-dark via-acai-surface to-acai-raised animate-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        onLoad={handleImageLoad}
        onError={handleImageError}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
  )
}
