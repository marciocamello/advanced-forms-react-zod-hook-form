import { createClient, SupabaseClient } from '@supabase/supabase-js'

export default (): SupabaseClient<any, "public", any> => {

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''
    const supabaseKey = import.meta.env.VITE_SUPABASE_KEY ?? ''

    return createClient(supabaseUrl, supabaseKey) as SupabaseClient;
}