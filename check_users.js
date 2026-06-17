const { createClient } = require("@supabase/supabase-js")
const fs = require("fs")
const path = require("path")

// Load environment variables from .env.local
const envPath = path.resolve(__dirname, ".env.local")
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf8")
  content.split(/\r?\n/).forEach(line => {
    if (!line || line.startsWith("#")) return
    const index = line.indexOf("=")
    if (index > 0) {
      const key = line.substring(0, index).trim()
      let val = line.substring(index + 1).trim()
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.substring(1, val.length - 1)
      }
      process.env[key] = val
    }
  })
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Service Role Key

if (!supabaseUrl || !supabaseKey) {
  console.error("Error: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
})

async function checkUsers() {
  try {
    // 1. Fetch public.user profiles
    const { data: publicUsers, error: publicError } = await supabase
      .from("user")
      .select("*")
    
    if (publicError) throw publicError

    console.log("=== Public Profiles ===")
    console.log(JSON.stringify(publicUsers, null, 2))

    // 2. Fetch auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    if (authError) throw authError

    console.log("\n=== Auth Users ===")
    const mappedAuth = authUsers.users.map(u => ({
      id: u.id,
      email: u.email,
      email_confirmed_at: u.email_confirmed_at,
      last_sign_in_at: u.last_sign_in_at,
      invited_at: u.invited_at,
      confirmation_sent_at: u.confirmation_sent_at
    }))
    console.log(JSON.stringify(mappedAuth, null, 2))

  } catch (err) {
    console.error("Error:", err)
  }
}

checkUsers()
