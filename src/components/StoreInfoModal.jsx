import React from 'react'

const HOURS = [
  { day: 'Segunda',  slots: ['13:00 - 17:30', '19:00 - 22:00'] },
  { day: 'Terça',    slots: ['13:00 - 17:30', '19:00 - 22:30'] },
  { day: 'Quarta',   slots: ['13:00 - 17:30', '18:00 - 22:30'] },
  { day: 'Quinta',   slots: ['13:00 - 17:30', '19:00 - 22:30'] },
  { day: 'Sexta',    slots: ['13:00 - 17:30', '19:00 - 22:30'] },
  { day: 'Sábado',   slots: ['13:00 - 17:30', '19:00 - 22:30'] },
  { day: 'Domingo',  slots: ['13:00 - 17:30', '19:00 - 22:30'] },
]

const MAPS_URL = 'https://www.google.com/maps'

// SVG Logo inline - Bowl de açaí genérico
const AcaiLogo = () => (
  <svg width="64" height="64" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    {/* Bowl */}
    <path d="M 20 40 L 25 85 L 75 85 L 80 40 Z" fill="#8B4789" stroke="#D4A5D4" strokeWidth="2"/>
    {/* Acai filling */}
    <ellipse cx="50" cy="45" rx="28" ry="12" fill="#9D3F7F"/>
    {/* Shine effect */}
    <ellipse cx="50" cy="42" rx="22" ry="8" fill="#C04FA8" opacity="0.6"/>
    {/* Toppings - granola circles */}
    <circle cx="35" cy="50" r="3" fill="#D4AF37"/>
    <circle cx="55" cy="52" r="2.5" fill="#D4AF37"/>
    <circle cx="65" cy="48" r="3" fill="#D4AF37"/>
    <circle cx="45" cy="55" r="2" fill="#E8C050"/>
  </svg>
)

export default function StoreInfoModal({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-acai-surface rounded-t-3xl max-h-[85vh] overflow-y-auto animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-purple-700/50 rounded-full" />
        </div>

        {/* Logo + nome */}
        <div className="flex flex-col items-center pt-4 pb-5 px-6 border-b border-acai-border">
          <AcaiLogo />
          <h2 className="text-xl font-bold text-white tracking-tight mt-2">Açaí Concept</h2>
          <p className="text-xs text-acai-text-muted mt-0.5">Sorveteria & Açaiteria</p>
        </div>

        <div className="px-6 pt-4 pb-2 space-y-5">

          {/* WhatsApp */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex-shrink-0 bg-green-500/15 rounded-2xl flex items-center justify-center">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.118 1.528 5.845L.057 23.716a.5.5 0 00.61.637l6.037-1.583A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.815 9.815 0 01-5.012-1.374l-.36-.213-3.724.977.994-3.634-.234-.374A9.817 9.817 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 mb-0.5">WhatsApp</p>
              <a
                href="https://wa.me/5511999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-green-400 active:opacity-70"
              >
                (11) 99999-9999
              </a>
            </div>
          </div>

          {/* Endereço */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex-shrink-0 bg-pink-500/15 rounded-2xl flex items-center justify-center">
              <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 mb-0.5">Endereço</p>
              <p className="text-sm text-white leading-snug">
                Rua Exemplo, 123<br />
                Centro, Sua Cidade – SP
              </p>
              <a
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-pink-400 mt-1 inline-block active:opacity-70"
              >
                Abrir no Google Maps →
              </a>
            </div>
          </div>

          {/* Horários */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 flex-shrink-0 bg-purple-500/15 rounded-2xl flex items-center justify-center">
                <svg className="w-5 h-5 text-acai-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-white">Horário de Funcionamento</p>
            </div>
            <div className="bg-acai-raised rounded-2xl overflow-hidden divide-y divide-purple-800/20">
              {HOURS.map(({ day, slots }) => (
                <div key={day} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-xs text-gray-400 w-16 flex-shrink-0">{day}</span>
                  <div className="flex flex-col items-end gap-0.5">
                    {slots.map(s => (
                      <span key={s} className="text-xs font-medium text-white">{s}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Fechar */}
        <div className="px-6 pt-3 pb-6">
          <button
            onClick={onClose}
            className="w-full py-3.5 bg-purple-900/50 rounded-2xl text-sm font-semibold text-gray-300 active:scale-95 transition-all"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
