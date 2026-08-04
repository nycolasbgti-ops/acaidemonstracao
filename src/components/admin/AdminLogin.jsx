import React, { useState } from 'react'

export default function AdminLogin({ onLogin, onClose }) {
  const [pin, setPin]     = useState('')
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(false)

  const handleDigit = (d) => {
    if (pin.length >= 4) return
    const next = pin + d
    setPin(next)
    setError(false)

    if (next.length === 4) {
      const ok = onLogin(next)
      if (!ok) {
        setError(true)
        setShake(true)
        setTimeout(() => { setShake(false); setPin('') }, 600)
      }
    }
  }

  const handleDel = () => {
    setPin(p => p.slice(0, -1))
    setError(false)
  }

  const PAD = [1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, '⌫']

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-t-3xl p-6 pb-10 w-full max-w-sm mx-auto animate-slideUp shadow-xl">
        <div className="flex justify-center mb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Icon + title */}
        <div className="text-center mt-4 mb-8">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Painel Administrativo</h2>
          <p className="text-sm text-gray-500 mt-1">Digite o PIN de acesso</p>
        </div>

        {/* PIN dots */}
        <div className={`flex justify-center gap-5 mb-8 ${shake ? 'animate-shake' : ''}`}>
          {[0, 1, 2, 3].map(i => (
            <div key={i}
              className={`w-4 h-4 rounded-full transition-all duration-200 ${
                i < pin.length
                  ? error ? 'bg-red-500 scale-110' : 'bg-purple-700 scale-110'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-3">
          {PAD.map((key, i) => {
            if (key === null) return <div key={i} />
            return (
              <button key={i}
                onClick={() => key === '⌫' ? handleDel() : handleDigit(String(key))}
                className={`h-14 rounded-2xl text-lg font-semibold transition-all active:scale-90
                  ${key === '⌫'
                    ? 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}>
                {key}
              </button>
            )
          })}
        </div>

        {error && (
          <p className="text-center text-red-600 text-sm mt-4">PIN incorreto. Tente novamente.</p>
        )}
      </div>
    </div>
  )
}
