import React, { useState } from 'react'

const ADMIN_PIN  = process.env.REACT_APP_ADMIN_PIN || '123456'
const PIN_LENGTH = ADMIN_PIN.length

export default function AdminLogin({ onSuccess, onClose }) {
  const [pin,   setPin]   = useState('')
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(false)

  const handleDigit = (d) => {
    if (shake || pin.length >= PIN_LENGTH) return
    const next = pin + d
    setPin(next)
    setError(false)

    if (next.length === PIN_LENGTH) {
      if (next === ADMIN_PIN) {
        onSuccess()
      } else {
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

      <div className="relative bg-zinc-900 rounded-t-3xl p-6 pb-10 w-full max-w-sm mx-auto animate-slideUp shadow-xl border-t border-zinc-800">
        <div className="flex justify-center mb-1">
          <div className="w-10 h-1 bg-zinc-700 rounded-full" />
        </div>

        {/* PIN dots */}
        <div className={`flex justify-center gap-3 my-8 ${shake ? 'animate-shake' : ''}`}>
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <div key={i}
              className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                i < pin.length
                  ? error ? 'bg-red-500 scale-110' : 'bg-purple-500 scale-110'
                  : 'bg-zinc-700'
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
                className="h-14 rounded-2xl text-lg font-semibold transition-all active:scale-90
                           bg-zinc-800 text-white hover:bg-zinc-700">
                {key}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
