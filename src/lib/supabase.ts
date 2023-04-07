import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_KEY
const supabaseKey = import.meta.env.VITE_SUPABASE_URL

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase