import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const STATUS_LABEL = {
  new:        { label: 'Recebido',    color: 'text-yellow-400',  bg: 'bg-yellow-950/40 border border-yellow-800' },
  preparing:  { label: 'Preparando', color: 'text-blue-400',    bg: 'bg-blue-950/40 border border-blue-800'     },
  ready:      { label: 'Pronto',     color: 'text-emerald-400', bg: 'bg-emerald-950/40 border border-emerald-800' },
  delivered:  { label: 'Entregue',   color: 'text-gray-400',    bg: 'bg-zinc-800 border border-zinc-700'    },
  cancelled:  { label: 'Cancelado',  color: 'text-red-400',     bg: 'bg-red-950/40 border border-red-800'       },
}

const fmt = (v) => `R$ ${Number(v || 0).toFixed(2).replace('.', ',')}`

function normalizePhone(raw) {
  return raw.replace(/\D/g, '')
}

export default function OrdersView() {
  const [phone,   setPhone]   = useState('')
  const [orders,  setOrders]  = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleSearch = async (e) => {
    e.preventDefault()
    const digits = normalizePhone(phone)
    if (digits.length < 8) { setError('Informe um número válido.'); return }
    setLoading(true)
    setError('')
    setOrders(null)
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_phone', digits)
        .order('created_at', { ascending: false })
      if (error) throw error
      setOrders(data)
    } catch (err) {
      setError('Erro ao buscar pedidos: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto bg-black px-4 pt-6 pb-32">
      <div className="max-w-lg mx-auto">

        <h2 className="text-xl font-bold text-white mb-1">Meus Pedidos</h2>
        <p className="text-sm text-gray-400 mb-6">Digite seu WhatsApp para consultar seus pedidos.</p>

        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="(00) 00000-0000"
            className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3
                       text-white placeholder-gray-500 outline-none
                       focus:ring-2 focus:ring-purple-700 focus:border-purple-700
                       text-sm transition-all shadow-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-3 bg-purple-900 hover:bg-purple-800 rounded-xl text-sm font-semibold
                       text-white active:scale-95 transition-all disabled:opacity-50 flex-shrink-0 shadow-sm"
          >
            {loading ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            ) : 'Buscar'}
          </button>
        </form>

        {error && (
          <p className="text-sm text-red-400 bg-red-950/40 border border-red-800 rounded-xl px-4 py-3 mb-4">
            {error}
          </p>
        )}

        {orders !== null && orders.length === 0 && (
          <div className="text-center py-12">
            <span className="text-4xl block mb-3">🔍</span>
            <p className="text-gray-400 text-sm">Nenhum pedido encontrado para esse número.</p>
          </div>
        )}

        {orders && orders.length > 0 && (
          <div className="space-y-3">
            {orders.map(order => {
              const st = STATUS_LABEL[order.status] ?? STATUS_LABEL.new
              const date = new Date(order.created_at).toLocaleString('pt-BR', {
                day: '2-digit', month: '2-digit', year: '2-digit',
                hour: '2-digit', minute: '2-digit',
              })
              return (
                <div key={order.id} className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 shadow-sm">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="text-xs text-gray-500">{date}</p>
                      <p className="text-sm font-bold text-white mt-0.5">{order.customer_name}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${st.bg} ${st.color}`}>
                      {st.label}
                    </span>
                  </div>

                  <div className="space-y-1 mb-3">
                    {(order.items ?? []).map((item, i) => (
                      <div key={i} className="flex justify-between text-xs text-gray-400">
                        <span>{item.qty ?? 1}× {item.name}</span>
                        <span>{fmt(item.price * (item.qty ?? 1))}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                    <span className="text-xs text-gray-400">
                      {order.delivery_type === 'delivery' ? '🛵 Entrega' : '🏪 Retirada'}
                    </span>
                    <span className="text-sm font-bold text-emerald-400">{fmt(order.total)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
