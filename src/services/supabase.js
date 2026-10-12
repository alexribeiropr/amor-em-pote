import { createClient } from '@supabase/supabase-js';

const DEFAULT_URL = 'https://sioyhnzrsnwkfukskpzn.supabase.co';
const DEFAULT_KEY = 'sb_publishable_XYUdRwcqF7ayvn193-zAqw_8iuku5ui';

const getUrl = () => import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('amor_supabase_url') || DEFAULT_URL;
const getKey = () => import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('amor_supabase_anon_key') || DEFAULT_KEY;

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
