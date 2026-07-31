import React, { useState } from 'react'
import { api } from '../api'
import { fmt } from '../utils/price'

const PAYMENT_OPTIONS = [
  { value: 'pix',    label: '💠 Pix' },
  { value: 'credit', label: '💳 Crédito' },
  { value: 'debit',  label: '💳 Débito' },
  { value: 'cash',   label: '💵 Dinheiro' },
]

function ItemSummaryLine({ item }) {
  const qty = item.qty || 1
  return (
    <div className="py-1.5 border-b border-white/5 last:border-0">
      <div className="flex justify-between text-sm">
        <span className="text-gray-300 pr-2">
          {qty}× {item.name}
        </span>
        <span className="text-acai-gold font-semibold flex-shrink-0">
          {fmt(item.price * qty)}
        </span>
      </div>
      {item.type === 'acai' && (
        <div className="mt-0.5 space-y-0.5">
          {item.base && (
            <p className="text-xs text-gray-500">🍧 {item.base.label}</p>
          )}
          {item.toppings?.length > 0 && (
            <p className="text-xs text-gray-600">
              + {item.toppings.map(t => t.label).join(', ')}
            </p>
          )}
          {item.extras?.length > 0 && (
            <p className="text-xs text-gray-600">
              ✨ {item.extras.map(e => e.label).join(', ')}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default function CheckoutView({ cart, total, onBack, onConfirm }) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    deliveryType: 'delivery',
    address: '',
    payment: 'pix',
    changeFor: '',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }))

  const validate = () => {
    if (!form.name.trim())  return 'Por favor, informe seu nome.'
    if (!form.phone.trim()) return 'Por favor, informe seu telefone.'
    if (form.deliveryType === 'delivery' && !form.address.trim())
      return 'Por favor, informe o endereço de entrega.'
    return null
  }

  const handleSubmit = async () => {
    const err = validate()
    if (err) { setError(err); return }

    setLoading(true)
    setError('')

    try {
      const order = await api.createOrder({
        customer_name:  form.name.trim(),
        customer_phone: form.phone.trim(),
        delivery_type:  form.deliveryType,
        address:        form.deliveryType === 'delivery' ? form.address.trim() : null,
        payment_method: form.payment,
        change_for:     form.payment === 'cash' && form.changeFor.trim() ? form.changeFor.trim() : null,
        items:          cart,
        total,
        notes:          form.notes.trim() || null,
      })
      onConfirm({ ...order, items: cart })
    } catch (e) {
      console.error('Erro ao criar pedido:', e)
      setError('Não foi possível salvar o pedido. Verifique sua conexão e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-acai-dark text-white flex flex-col">
      {/* Nav */}
      <div className="sticky top-0 z-10 bg-acai-dark/95 backdrop-blur-xl border-b border-white/5
                      px-4 h-16 flex items-center gap-3">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center -ml-1 text-acai-gold">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-lg font-bold leading-tight">Confirmar Pedido</h1>
          <p className="text-xs text-gray-500">{cart.length} {cart.length === 1 ? 'item' : 'itens'}</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 max-w-lg mx-auto w-full pb-36">

        {/* Summary */}
        <section className="bg-acai-surface rounded-2xl p-4 border border-acai-border">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Resumo</p>
          {cart.map(item => (
            <ItemSummaryLine key={item.cartId} item={item} />
          ))}
          <div className="flex justify-between mt-3 pt-3 border-t border-white/5 font-bold text-base">
            <span>Total</span>
            <span className="text-white">{fmt(total)}</span>
          </div>
        </section>

        {/* Personal data */}
        <section className="bg-acai-surface rounded-2xl p-4 space-y-4 border border-acai-border">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Seus dados</p>

          <div>
            <label className="text-xs text-gray-500 block mb-1.5">Nome completo *</label>
            <input
              type="text"
              autoComplete="name"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="João Silva"
              className="w-full bg-acai-raised rounded-xl px-4 py-3.5 text-white placeholder-gray-600
                         outline-none focus:ring-2 focus:ring-acai-accent transition-all text-sm border border-acai-border"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1.5">Telefone / WhatsApp *</label>
            <input
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={e => set('phone', e.target.value)}
              placeholder="(11) 99999-9999"
              className="w-full bg-acai-raised rounded-xl px-4 py-3.5 text-white placeholder-gray-600
                         outline-none focus:ring-2 focus:ring-acai-accent transition-all text-sm border border-acai-border"
            />
          </div>
        </section>

        {/* Delivery */}
        <section className="bg-acai-surface rounded-2xl p-4 space-y-4 border border-acai-border">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Entrega</p>

          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'delivery', label: '🛵 Entrega',  sub: 'No seu endereço' },
              { value: 'pickup',   label: '🏪 Retirada', sub: 'Na loja' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => set('deliveryType', opt.value)}
                className={`py-3.5 px-4 rounded-2xl text-left transition-all border ${
                  form.deliveryType === opt.value
                    ? 'bg-acai-accent/20 border-acai-accent'
                    : 'bg-acai-raised border-acai-border'
                }`}
              >
                <p className="font-semibold text-sm">{opt.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{opt.sub}</p>
              </button>
            ))}
          </div>

          {form.deliveryType === 'delivery' && (
            <div>
              <label className="text-xs text-gray-500 block mb-1.5">Endereço de entrega *</label>
              <textarea
                value={form.address}
                onChange={e => set('address', e.target.value)}
                placeholder="Rua, número, bairro, complemento..."
                rows={3}
                className="w-full bg-acai-raised rounded-xl px-4 py-3.5 text-white placeholder-gray-600
                           outline-none focus:ring-2 focus:ring-acai-accent transition-all resize-none text-sm border border-acai-border"
              />
            </div>
          )}
        </section>

        {/* Payment */}
        <section className="bg-acai-surface rounded-2xl p-4 space-y-3 border border-acai-border">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Pagamento</p>

          <div className="grid grid-cols-2 gap-2">
            {PAYMENT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => set('payment', opt.value)}
                className={`py-3.5 px-4 rounded-2xl text-left transition-all border ${
                  form.payment === opt.value
                    ? 'bg-acai-accent/20 border-acai-accent'
                    : 'bg-acai-raised border-acai-border'
                }`}
              >
                <p className="font-semibold text-sm">{opt.label}</p>
              </button>
            ))}
          </div>

          {form.payment === 'cash' && (
            <div>
              <label className="text-xs text-gray-500 block mb-1.5">Troco para quanto? (opcional)</label>
              <input
                type="text"
                value={form.changeFor}
                onChange={e => set('changeFor', e.target.value)}
                placeholder="Ex: R$ 100,00"
                className="w-full bg-acai-raised rounded-xl px-4 py-3.5 text-white placeholder-gray-600
                           outline-none focus:ring-2 focus:ring-acai-accent transition-all text-sm border border-acai-border"
              />
            </div>
          )}
        </section>

        {/* Notes */}
        <section className="bg-acai-surface rounded-2xl p-4 border border-acai-border">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-3">
            Observações (opcional)
          </label>
          <textarea
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
            placeholder="Alguma alergia, sem granola, ponto específico..."
            rows={2}
            className="w-full bg-acai-raised rounded-xl px-4 py-3.5 text-white placeholder-gray-600
                       outline-none focus:ring-2 focus:ring-acai-accent transition-all resize-none text-sm border border-acai-border"
          />
        </section>
      </div>

      {/* Sticky footer CTA */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pt-4 pb-8 bg-gradient-to-t from-[#07011A] via-[#07011A] to-transparent">
        <div className="max-w-lg mx-auto">
          {error && (
            <div className="mb-3 bg-red-500/15 border border-red-500/30 rounded-xl px-4 py-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4 bg-[#DB2777] rounded-2xl font-bold text-[15px]
                       text-white active:scale-[0.98] transition-all disabled:opacity-50
                       shadow-lg shadow-[#DB2777]/40 flex items-center justify-between px-6"
          >
            <span>{loading ? 'Salvando...' : 'Confirmar Pedido'}</span>
            {!loading && <span className="font-bold">{fmt(total)}</span>}
          </button>
        </div>
      </div>
    </div>
  )
}
