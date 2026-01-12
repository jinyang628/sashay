import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
}

const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseAnonKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getUserIdOfAnonymousSignIn(): Promise<string> {
  const { data: authData, error: authError } = await supabase.auth.signInAnonymously();

  if (authError) {
    throw new Error('Supabase anonymous login failed', { cause: authError.message });
  }
  if (!authData?.user) {
    throw new Error('Supabase anonymous login failed: No user found');
  }
  const userId: string = authData.user.id;
  return userId;
}
