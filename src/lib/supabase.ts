import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Sanitize URL by trimming trailing slashes and stripping PostgREST endpoint suffix if provided
export function sanitizeSupabaseUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  let cleaned = rawUrl.trim();
  // Strip /rest/v1 or /rest/v1/ suffix if user copied PostgREST URL
  cleaned = cleaned.replace(/\/rest\/v1\/?$/i, '');
  // Strip trailing slashes
  cleaned = cleaned.replace(/\/+$/, '');
  return cleaned;
}

const DEFAULT_URL = 'https://rheiljgrmuyxnfbvqxsq.supabase.co';
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoZWlsamdybXV5eG5mYnZxeHNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1ODAyNTksImV4cCI6MjEwNDE1NjI1OX0.6IYKxvrc6FCEaJHGHBPymS-bRDHTWitVz1JgLBic3F0';

const rawEnvUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const rawEnvKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

// Allow runtime override via localStorage for convenient testing in AI Studio
let storedUrl = typeof window !== 'undefined' ? localStorage.getItem('atelier_supabase_url') || '' : '';
let storedKey = typeof window !== 'undefined' ? localStorage.getItem('atelier_supabase_key') || '' : '';

// If stored URL points to the previous template project, clear it so new credentials take effect
if (storedUrl && storedUrl.includes('zupladrtfneakcxtfkes')) {
  storedUrl = '';
  storedKey = '';
  if (typeof window !== 'undefined') {
    localStorage.removeItem('atelier_supabase_url');
    localStorage.removeItem('atelier_supabase_key');
  }
}

export const supabaseUrl = sanitizeSupabaseUrl(storedUrl || rawEnvUrl || DEFAULT_URL);
export const supabaseAnonKey = (storedKey || rawEnvKey || DEFAULT_KEY).trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://') &&
  supabaseUrl.includes('supabase.co')
);

let client: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  try {
    client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    client = null;
  }
}

export const supabase = client;

export function setCustomSupabaseCredentials(url: string, key: string) {
  if (typeof window !== 'undefined') {
    if (url && key) {
      localStorage.setItem('atelier_supabase_url', sanitizeSupabaseUrl(url));
      localStorage.setItem('atelier_supabase_key', key.trim());
    } else {
      localStorage.removeItem('atelier_supabase_url');
      localStorage.removeItem('atelier_supabase_key');
    }
    window.location.reload();
  }
}

