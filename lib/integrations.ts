/**
 * Integration boundary for the future FastAPI and Supabase services.
 * Keep credentials in environment variables; the frontend currently uses mock data.
 */
export const integrationConfig = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? '',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
} as const
