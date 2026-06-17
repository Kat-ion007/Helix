import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@/types/supabase";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    // Return a dummy client structure during next build to prevent static rendering crashes
    return {} as unknown as ReturnType<typeof createBrowserClient<Database>>;
  }

  return createBrowserClient<Database>(url, anonKey);
}

// Singleton browser client for easy import in client components
export const supabase = createClient();
