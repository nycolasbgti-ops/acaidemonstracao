import { createClient } from '@supabase/supabase-js'

const supabaseUrl     = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('REACT_APP_SUPABASE_URL e REACT_APP_SUPABASE_ANON_KEY não configuradas — cardápio e Painel Admin não vão funcionar.')
}

console.log('URL SUPABASE:', process.env.REACT_APP_SUPABASE_URL)

// Nunca deixe isto lançar no carregamento do módulo: o cardápio público do
// cliente também importa este arquivo (via useMenu) e não pode
// quebrar só porque as variáveis não foram configuradas.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
)
