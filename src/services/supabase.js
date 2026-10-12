import { createClient } from '@supabase/supabase-js';

// Prioridade: variáveis .env (Vite) ou chaves salvas pelo admin no painel
const getUrl = () => import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('amor_supabase_url') || '';
const getKey = () => import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('amor_supabase_anon_key') || '';

let clientInstance = null;

export function getSupabase() {
  const url = getUrl();
  const key = getKey();
  if (url && key) {
    if (!clientInstance) {
      clientInstance = createClient(url, key);
    }
    return clientInstance;
  }
  return null;
}

export function isSupabaseActive() {
  return Boolean(getUrl() && getKey());
}

export function setSupabaseCredentials(url, key) {
  if (url && key) {
    localStorage.setItem('amor_supabase_url', url.trim());
    localStorage.setItem('amor_supabase_anon_key', key.trim());
    clientInstance = createClient(url.trim(), key.trim());
    return clientInstance;
  }
  localStorage.removeItem('amor_supabase_url');
  localStorage.removeItem('amor_supabase_anon_key');
  clientInstance = null;
  return null;
}
