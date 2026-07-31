import React, { useEffect, useState } from 'react'
import { api } from '../api'
import { fmt } from '../utils/price'

const PAYMENT_LABELS = { pix: 'Pix', credit: 'Crédito', debit: 'Débito', cash: 'Dinheiro' }

function buildWAMessage(order) {
  const delivery = order.delivery_type === 'delivery' ? '🛵 Entrega' : '🏪 Retirada'
  const payment  = PAYMENT_LABELS[order.payment_method] || order.payment_method

  const lines = (order.items || []).map(i => {
    const qty    = i.qty || 1
    let   detail = ''
    if (i.type === 'acai') {
      if (i.base)            detail += ` | ${i.base.label}`
      if (i.toppings?.length) detail += ` + ${i.toppings.map(t => t.label).join(', ')}`
      if (i.extras?.length)   detail += ` ✨ ${i.extras.map(e => e.label).join(', ')}`
    }
    return `• ${qty}× ${i.name}${detail} — ${fmt(i.price * qty)}`
  }).join('\n')

  return encodeURIComponent(
    `*Pedido Confirmado!*\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `👤 *Cliente:* ${order.customer_name}\n` +
    `📱 *Telefone:* ${order.customer_phone}\n` +
    (order.address ? `🏠 *Endereço:* ${order.address}\n` : '') +
    `\n📦 *Itens:*\n${lines}\n\n` +
    `💰 *Total: ${fmt(order.total)}*\n` +
    `${delivery} • ${payment}\n` +
    (order.notes ? `\n📝 *Obs:* ${order.notes}\n` : '') +
    `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `Pedido feito pelo cardápio digital 🙏`
  )
}

function OrderItemLine({ item }) {
  const qty = item.qty || 1
  return (
    <div className="py-1.5 border-b border-white/5 last:border-0">
      <div className="flex justify-between text-sm">
        <span className="text-gray-300 pr-2">{qty}× {item.name}</span>
        <span className="text-[#DB2777] font-semibold flex-shrink-0">
          {fmt(item.price * qty)}
        </span>
      </div>
      {item.type === 'acai' && (
        <div className="mt-0.5 space-y-0.5">
          {item.base && <p className="text-xs text-gray-500">{item.base.label}</p>}
          {item.toppings?.length > 0 && (
            <p className="text-xs text-gray-600">+ {item.toppings.map(t => t.label).join(', ')}</p>
          )}
          {item.extras?.length > 0 && (
            <p className="text-xs text-gray-600">✨ {item.extras.map(e => e.label).join(', ')}</p>
          )}
        </div>
      )}
    </div>
  )
}

export default function ConfirmationView({ order, onNewOrder }) {
  const [tick,     setTick]     = useState(false)
  const [copied,   setCopied]   = useState(false)
  const [settings, setSettings] = useState({ pix_key: '', whatsapp_number: '' })

  useEffect(() => {
    const t = setTimeout(() => setTick(true), 100)
    api.getSettings().then(data => { if (data) setSettings(data) }).catch(() => {})
    return () => clearTimeout(t)
  }, [])

  const handleWA = () => {
    const msg = buildWAMessage(order)
    window.open(`https://wa.me/${settings.whatsapp_number}?text=${msg}`, '_blank', 'noopener')
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(settings.pix_key)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── Fluxo Pix: aguardando pagamento ───────────────────────────
  if (order.payment_method === 'pix') {
    return (
      <div className="min-h-screen bg-[#07011A] text-white flex flex-col items-center justify-center px-5 py-10">
        <div className="max-w-sm w-full text-center">

          <div className={`w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-7
                           transition-all duration-500 ${tick ? 'bg-[#DB2777]/20 scale-100' : 'scale-50 opacity-0'}`}>
            <span className={`text-5xl transition-all duration-500 delay-200 ${tick ? 'opacity-100' : 'opacity-0'}`}>
              ⏳
            </span>
          </div>

          <h1 className="text-3xl font-extrabold mb-2 text-[#DB2777]">Aguardando Pagamento!</h1>
          <p className="text-gray-400 text-[15px] mb-8 leading-relaxed">
            Para que o seu pedido seja confirmado e vá para<br />
            o preparo, pague a chave Pix abaixo e envie o<br />
            comprovante no nosso WhatsApp.
          </p>

          <div className="bg-[#0F0320] rounded-2xl p-4 mb-5 text-left border border-purple-800/20">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Seu pedido</p>
            {(order.items || []).map((item, i) => (
              <OrderItemLine key={i} item={item} />
            ))}
            <div className="flex justify-between pt-3 mt-1 border-t border-white/5 font-bold">
              <span>Total</span>
              <span className="text-xl text-[#DB2777]">{fmt(order.total)}</span>
            </div>
            <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap gap-2">
              <span className="text-xs bg-[#1A0B2E] px-2.5 py-1 rounded-full text-gray-400">
                {order.delivery_type === 'delivery' ? '🛵 Entrega' : '🏪 Retirada'}
              </span>
              <span className="text-xs bg-[#1A0B2E] px-2.5 py-1 rounded-full text-gray-400">💠 Pix</span>
            </div>
          </div>

          <div className="bg-[#0F0320] border border-[#DB2777]/40 rounded-2xl p-4 mb-5 text-left">
            <p className="text-xs font-semibold text-[#DB2777] uppercase tracking-widest mb-3">Chave Pix</p>
            <div className="flex items-center gap-2 mb-2.5">
              <p className="flex-1 font-mono text-sm bg-[#1A0B2E] rounded-xl px-3 py-2.5 text-white truncate select-all">
                {settings.pix_key || '—'}
              </p>
              <button
                onClick={handleCopy}
                className={`flex-shrink-0 px-4 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                  copied ? 'bg-green-500 text-white' : 'bg-[#DB2777] text-white shadow-lg shadow-[#DB2777]/40'
                }`}
              >
                {copied ? '✓ Copiado!' : 'Copiar'}
              </button>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Acesse seu banco, escolha Pix e cole a chave acima.
              O valor a pagar é <span className="text-[#DB2777] font-semibold">{fmt(order.total)}</span>.
            </p>
          </div>

          <button
            onClick={handleWA}
            className="w-full py-4 bg-[#25D366] text-white rounded-2xl font-bold text-[15px]
                       active:scale-[0.98] transition-all shadow-lg shadow-[#25D366]/30
                       flex items-center justify-center gap-3 mb-3"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Enviar comprovante pelo WhatsApp
          </button>

          <button
            onClick={onNewOrder}
            className="w-full py-3.5 bg-[#0F0320] rounded-2xl font-semibold text-gray-400 border border-purple-800/20
                       active:scale-[0.98] transition-all text-sm"
          >
            Fazer novo pedido
          </button>
        </div>
      </div>
    )
  }

  // ── Fluxo padrão: pedido confirmado ───────────────────────────
  return (
    <div className="min-h-screen bg-[#07011A] text-white flex flex-col items-center justify-center px-5 py-10">
      <div className="max-w-sm w-full text-center">
        <div className={`w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-7
                         transition-all duration-500 ${tick ? 'bg-green-500/20 scale-100' : 'scale-50 opacity-0'}`}>
          <svg
            className={`w-14 h-14 text-green-400 transition-all duration-500 delay-200 ${tick ? 'opacity-100' : 'opacity-0'}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-extrabold mb-2">Pedido Confirmado!</h1>
        <p className="text-gray-400 text-[15px] mb-8 leading-relaxed">
          Recebemos seu pedido e já estamos<br />preparando tudo com muito carinho.
        </p>

        <div className="bg-[#0F0320] rounded-2xl p-4 mb-5 text-left border border-purple-800/20">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Seu pedido</p>
          {(order.items || []).map((item, i) => (
            <OrderItemLine key={i} item={item} />
          ))}
          <div className="flex justify-between pt-3 mt-1 border-t border-white/5 font-bold">
            <span>Total</span>
            <span className="text-xl">{fmt(order.total)}</span>
          </div>
          <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap gap-2">
            <span className="text-xs bg-[#1A0B2E] px-2.5 py-1 rounded-full text-gray-400">
              {order.delivery_type === 'delivery' ? '🛵 Entrega' : '🏪 Retirada'}
            </span>
            <span className="text-xs bg-[#1A0B2E] px-2.5 py-1 rounded-full text-gray-400">
              {PAYMENT_LABELS[order.payment_method] || order.payment_method}
            </span>
          </div>
        </div>

        <button
          onClick={handleWA}
          className="w-full py-4 bg-[#25D366] text-white rounded-2xl font-bold text-[15px]
                     active:scale-[0.98] transition-all shadow-lg shadow-[#25D366]/30
                     flex items-center justify-center gap-3 mb-3"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Enviar resumo pelo WhatsApp
        </button>

        <button
          onClick={onNewOrder}
          className="w-full py-3.5 bg-[#0F0320] rounded-2xl font-semibold text-gray-400 border border-purple-800/20
                     active:scale-[0.98] transition-all text-sm"
        >
          Fazer novo pedido
        </button>
      </div>
    </div>
  )
}
