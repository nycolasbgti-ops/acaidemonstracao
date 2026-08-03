import React, { useState, useEffect, useCallback } from 'react'
import { api } from '../../api'
import { fmt } from '../../utils/price'
import MenuManager from './MenuManager'
import AddonsManager from './AddonsManager'

const N8N_WEBHOOK_URL = 'https://n8n.nycolasdev.com.br/webhook/saiu-entrega'

function formatPhone(raw) {
  const digits = String(raw || '').replace(/\D/g, '')
  return digits.startsWith('55') ? digits : `55${digits}`
}

const STATUS = {
  new:        { label: 'Novo',            icon: '🆕', bg: 'bg-blue-500',   next: 'preparing',  nextBtn: 'Iniciar Preparo'  },
  preparing:  { label: 'Em Preparo',      icon: '👨‍🍳', bg: 'bg-yellow-500', next: 'delivering', nextBtn: 'Saiu p/ Entrega' },
  delivering: { label: 'Saiu p/ Entrega', icon: '🛵', bg: 'bg-orange-500', next: 'delivered',  nextBtn: 'Marcar Entregue' },
  delivered:  { label: 'Entregue',        icon: '✅', bg: 'bg-green-600',  next: null,         nextBtn: null              },
}

const ORDER_TABS = [
  { key: 'new',        label: 'Novos'    },
  { key: 'preparing',  label: 'Preparo'  },
  { key: 'delivering', label: 'Entrega'  },
  { key: 'delivered',  label: 'Entregues'},
]

const PAYMENT_LABELS = { pix: 'Pix', credit: 'Crédito', debit: 'Débito', cash: 'Dinheiro' }

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60)   return `${diff}s atrás`
  if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`
  return `${Math.floor(diff / 3600)}h atrás`
}

function buildComanda(order) {
  const sep = '================================'
  const div = '--------------------------------'
  const id4 = String(order.id || '').slice(-4)
  const pay = PAYMENT_LABELS[order.payment_method] || order.payment_method

  const itemLines = (order.items || []).flatMap(item => {
    const lines = [`${item.qty || 1}x ${item.name}`]
    if (item.type === 'acai') {
      if (item.base)             lines.push(`  Massa: ${item.base.label}`)
      if (item.caldas?.length)   lines.push(`  Caldas: ${item.caldas.map(c => c.label).join(', ')}`)
      if (item.toppings?.length) lines.push(`  Acomp: ${item.toppings.map(t => t.label).join(', ')}`)
      if (item.extras?.length)   lines.push(`  Extras: ${item.extras.map(e => e.label).join(', ')}`)
    }
    if (item.type === 'flavored' && item.flavors?.length) {
      const fl = item.flavors.filter(f => f.qty > 0).map(f => `${f.qty}x ${f.name}`).join(', ')
      if (fl) lines.push(`  Sabores: ${fl}`)
    }
    return lines
  }).join('\n')

  const parts = [
    sep,
    '          AÇAÍ CONCEPT',
    sep,
    `Pedido: #${id4}`,
    '',
    'Cliente:',
    order.customer_name,
    '',
    'Telefone:',
    order.customer_phone,
  ]

  if (order.address) parts.push('', 'Endereço:', order.address)
  parts.push(div, itemLines)
  if (order.notes) parts.push('', 'Observação:', order.notes)
  parts.push(div, `Total: ${fmt(order.total)}`, '', 'Forma de pagamento:', pay, sep)

  return parts.join('\n')
}

function PrintModal({ order, onClose }) {
  const [text, setText] = React.useState(() => buildComanda(order))

  const handlePrint = () => {
    const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    const win = window.open('', '_blank', 'width=420,height=640')
    win.document.write(
      `<!DOCTYPE html><html><head><title>Comanda #${String(order.id || '').slice(-4)}</title>` +
      `<style>@media print{body{margin:0}}body{margin:8px}</style></head><body>` +
      `<pre style="font-family:monospace;font-size:14px;white-space:pre-wrap">${escaped}</pre>` +
      `<script>window.onload=function(){window.print();setTimeout(function(){window.close()},500)}<\/script>` +
      `</body></html>`
    )
    win.document.close()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="bg-acai-surface rounded-2xl w-full max-w-sm flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-acai-border flex-shrink-0">
          <div>
            <p className="font-bold text-base">🖨️ Imprimir Comanda</p>
            <p className="text-xs text-gray-500 mt-0.5">Edite antes de imprimir se necessário</p>
          </div>
          <button onClick={onClose}
            className="w-10 h-10 bg-[#242424] rounded-full flex items-center justify-center text-gray-400 text-sm active:scale-95 transition-all flex-shrink-0">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            rows={14}
            spellCheck={false}
            className="w-full bg-[#242424] rounded-xl px-3 py-3 font-mono text-xs text-gray-200
                       outline-none focus:ring-2 focus:ring-purple-700 resize-none leading-relaxed transition-all"
          />
        </div>

        <div className="flex gap-3 px-4 pb-5 flex-shrink-0">
          <button onClick={onClose}
            className="flex-1 py-3.5 bg-[#242424] rounded-2xl text-sm font-semibold text-gray-400 active:scale-95 transition-all">
            Cancelar
          </button>
          <button onClick={handlePrint}
            className="flex-1 py-3.5 bg-purple-700 text-white rounded-2xl text-sm font-bold
                       active:scale-95 transition-all shadow-md shadow-purple-900/30 flex items-center justify-center gap-2">
            🖨️ Confirmar Impressão
          </button>
        </div>
      </div>
    </div>
  )
}

function OrderCard({ order, onAdvance, onPrint }) {
  const cfg  = STATUS[order.status] ?? STATUS.new
  const [busy, setBusy] = useState(false)

  const advance = async () => {
    if (!cfg.next || busy) return
    setBusy(true)
    await onAdvance(order, cfg.next)
    setBusy(false)
  }

  return (
    <div className={`bg-acai-surface rounded-2xl p-4 mb-3 ${order.status === 'new' ? 'ring-1 ring-blue-500/40' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-bold text-base leading-snug">{order.customer_name}</p>
          <p className="text-sm text-gray-400">{order.customer_phone}</p>
          <p className="text-xs text-gray-600 mt-0.5">{timeAgo(order.created_at)}</p>
        </div>
        <span className={`${cfg.bg} text-white text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0`}>
          {cfg.icon} {cfg.label}
        </span>
      </div>

      <div className="space-y-1 mb-3">
        {(order.items || []).map((item, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="text-gray-300 pr-2">{item.qty || 1}× {item.name}</span>
            <span className="text-purple-400 font-medium flex-shrink-0">{fmt(item.price * (item.qty || 1))}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between py-2.5 border-t border-b border-acai-border mb-3">
        <div className="flex gap-1.5 flex-wrap">
          <span className="text-xs bg-[#242424] px-2 py-0.5 rounded-full text-gray-400">
            {order.delivery_type === 'delivery' ? '🛵 Entrega' : '🏪 Retirada'}
          </span>
          <span className="text-xs bg-[#242424] px-2 py-0.5 rounded-full text-gray-400">
            {PAYMENT_LABELS[order.payment_method] || order.payment_method}
          </span>
        </div>
        <span className="font-bold text-base text-white">{fmt(order.total)}</span>
      </div>

      {order.address && (
        <p className="text-xs text-gray-500 mb-3 flex gap-1.5"><span>📍</span><span>{order.address}</span></p>
      )}
      {order.notes && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-3 py-2 mb-3">
          <p className="text-xs text-yellow-300">📝 {order.notes}</p>
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={() => onPrint(order)}
          className="flex-1 py-3 bg-[#242424] rounded-xl text-sm font-semibold text-gray-300
                     active:scale-[0.97] transition-all flex items-center justify-center gap-1.5">
          🖨️ Imprimir
        </button>
        {cfg.next && (
          <button onClick={advance} disabled={busy}
            className="flex-1 py-3 bg-purple-700 rounded-xl font-bold text-sm text-white
                       active:scale-[0.97] transition-all disabled:opacity-50 shadow-md shadow-purple-900/30">
            {busy ? '...' : cfg.nextBtn}
          </button>
        )}
      </div>
    </div>
  )
}

// ── Painel de Pedidos ─────────────────────────────────────────

function OrdersPanel({ orders, loading, connOk, onAdvance, onRefetch }) {
  const [activeTab,  setActiveTab]  = useState('new')
  const [printModal, setPrintModal] = useState(null)

  const filtered = orders.filter(o => o.status === activeTab)
  const newCount = orders.filter(o => o.status === 'new').length

  return (
    <>
      <div className="flex border-b border-acai-border bg-[#0A0A0A]">
        {ORDER_TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-3 text-xs sm:text-sm font-semibold relative transition-colors whitespace-nowrap ${
              activeTab === tab.key ? 'text-white' : 'text-gray-600'
            }`}>
            {tab.label}
            {tab.key === 'new' && newCount > 0 && (
              <span className="ml-1 bg-purple-700 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 align-middle">
                {newCount}
              </span>
            )}
            {activeTab === tab.key && (
              <div className="absolute bottom-0 inset-x-0 h-0.5 bg-purple-700 rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {printModal && <PrintModal order={printModal} onClose={() => setPrintModal(null)} />}

      <div className="flex-1 overflow-y-auto px-4 py-4 max-w-lg mx-auto w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-2 border-purple-700 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Carregando pedidos...</p>
          </div>
        ) : !connOk ? (
          <div className="text-center py-16 px-4">
            <span className="text-5xl block mb-4">⚠️</span>
            <p className="text-gray-300 font-semibold mb-1">Erro de conexão</p>
            <p className="text-gray-500 text-sm mb-5">Não foi possível conectar à API.</p>
            <button onClick={onRefetch}
              className="px-5 py-2.5 bg-acai-surface rounded-xl text-sm font-semibold">
              Tentar novamente
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-5xl block mb-4">{STATUS[activeTab]?.icon || '📋'}</span>
            <p className="text-gray-500 font-medium">Nenhum pedido aqui</p>
          </div>
        ) : (
          filtered.map(order => (
            <OrderCard key={order.id} order={order} onAdvance={onAdvance} onPrint={setPrintModal} />
          ))
        )}
      </div>
    </>
  )
}

// ── Configurações ─────────────────────────────────────────────

function SettingsPanel() {
  const [form,    setForm]    = useState({ pix_key: '', whatsapp_number: '' })
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [error,   setError]   = useState('')

  useEffect(() => {
    api.getSettings()
      .then(data => setForm({ pix_key: data.pix_key || '', whatsapp_number: data.whatsapp_number || '' }))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    setError('')
    try {
      await api.updateSettings({ pix_key: form.pix_key.trim(), whatsapp_number: form.whatsapp_number.trim() })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const inputCls = 'w-full bg-[#242424] rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-purple-700 transition-all text-sm font-mono'

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <div className="w-6 h-6 border-2 border-purple-700 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-bold mb-1">Configurações</h3>
        <p className="text-xs text-gray-500">Alterações entram em vigor imediatamente para todos os clientes.</p>
      </div>

      {error && <p className="text-red-400 text-sm bg-red-500/10 rounded-xl px-4 py-2">{error}</p>}

      <div className="bg-acai-surface rounded-2xl p-4">
        <label className="text-xs text-purple-400 font-semibold uppercase tracking-widest block mb-2">💠 Chave Pix</label>
        <input
          type="text"
          value={form.pix_key}
          onChange={e => setForm(f => ({ ...f, pix_key: e.target.value }))}
          placeholder="CPF, CNPJ, e-mail, telefone ou chave aleatória"
          className={inputCls}
        />
      </div>

      <div className="bg-acai-surface rounded-2xl p-4">
        <label className="text-xs text-purple-400 font-semibold uppercase tracking-widest block mb-2">📱 Número do WhatsApp</label>
        <input
          type="text"
          value={form.whatsapp_number}
          onChange={e => setForm(f => ({ ...f, whatsapp_number: e.target.value }))}
          placeholder="5511999999999"
          className={inputCls}
        />
        <p className="text-xs text-gray-600 mt-2">Formato internacional sem + ou espaços. Ex.: 5511999999999</p>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className={`w-full py-4 rounded-2xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50 ${
          saved ? 'bg-green-500 text-white' : 'bg-purple-700 text-white shadow-md shadow-purple-900/30'
        }`}
      >
        {saving ? 'Salvando...' : saved ? '✓ Salvo com sucesso!' : 'Salvar Configurações'}
      </button>
    </div>
  )
}

// ── AdminPanel root ───────────────────────────────────────────

const MAIN_TABS = [
  { key: 'orders',   label: '📋 Pedidos'       },
  { key: 'menu',     label: '🍧 Cardápio'      },
  { key: 'addons',   label: '🧂 Adicionais'    },
  { key: 'settings', label: '⚙️ Config'        },
]

export default function AdminPanel({ onBack }) {
  const [mainTab,       setMainTab]       = useState('orders')
  const [orders,        setOrders]        = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [connOk,        setConnOk]        = useState(true)

  const fetchOrders = useCallback(() => {
    api.getOrders()
      .then(data => { setOrders(data); setConnOk(true) })
      .catch(() => setConnOk(false))
      .finally(() => setOrdersLoading(false))
  }, [])

  useEffect(() => {
    fetchOrders()

    const sse = api.ordersEvents()

    sse.addEventListener('order-insert', e => {
      setOrders(prev => [JSON.parse(e.data), ...prev])
    })
    sse.addEventListener('order-update', e => {
      const updated = JSON.parse(e.data)
      setOrders(prev => prev.map(o => o.id === updated.id ? updated : o))
    })
    sse.addEventListener('connected', () => setConnOk(true))
    sse.onerror = () => setConnOk(false)

    return () => sse.close()
  }, [fetchOrders])

  const handleAdvance = async (order, status) => {
    try {
      await api.updateOrder(order.id, { status })

      if (status === 'delivering') {
        const pedido = (order.items || []).map(item => {
          let detail = item.name
          if (item.type === 'acai' && item.base) detail += ` (${item.base.label})`
          return `${item.qty || 1}x ${detail}`
        }).join(', ')

        fetch(N8N_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nome:     order.customer_name,
            telefone: formatPhone(order.customer_phone),
            pedido,
          }),
        }).catch(err => console.error('Webhook n8n falhou:', err))
      }
    } catch (e) {
      console.error('Falha ao avançar pedido:', e)
    }
  }

  const newCount = orders.filter(o => o.status === 'new').length

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-acai-border
                      px-4 h-16 flex items-center gap-3">
        <div className="flex-1">
          <h1 className="text-lg font-bold leading-tight">Painel Admin</h1>
          <p className="text-xs text-gray-500">
            {{ orders: 'Pedidos em tempo real', menu: 'Gerenciar cardápio', addons: 'Massas, caldas e acompanhamentos', settings: 'Chave Pix e WhatsApp' }[mainTab]}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${connOk ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
          <span className={`text-xs font-medium ${connOk ? 'text-green-400' : 'text-red-400'}`}>
            {connOk ? 'Ao vivo' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Main tabs */}
      <div className="flex border-b border-acai-border bg-[#0A0A0A]">
        {MAIN_TABS.map(tab => (
          <button key={tab.key} onClick={() => setMainTab(tab.key)}
            className={`flex-1 py-3 text-[11px] sm:text-sm font-semibold relative transition-colors ${
              mainTab === tab.key ? 'text-white' : 'text-gray-500'
            }`}>
            {tab.label}
            {tab.key === 'orders' && newCount > 0 && (
              <span className="ml-1 bg-purple-700 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 align-middle">
                {newCount}
              </span>
            )}
            {mainTab === tab.key && (
              <div className="absolute bottom-0 inset-x-0 h-0.5 bg-purple-700 rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {mainTab === 'orders' ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          <OrdersPanel
            orders={orders}
            loading={ordersLoading}
            connOk={connOk}
            onAdvance={handleAdvance}
            onRefetch={fetchOrders}
          />
        </div>
      ) : mainTab === 'addons' ? (
        <div className="flex-1 overflow-y-auto px-4 py-5 max-w-lg mx-auto w-full pb-10">
          <AddonsManager />
        </div>
      ) : mainTab === 'settings' ? (
        <div className="flex-1 overflow-y-auto px-4 py-5 max-w-lg mx-auto w-full pb-10">
          <SettingsPanel />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 py-5 max-w-lg mx-auto w-full pb-10">
          <MenuManager />
        </div>
      )}
    </div>
  )
}
