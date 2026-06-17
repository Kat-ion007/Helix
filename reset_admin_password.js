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

const supabase = createClient(supabaseUrl, supabaseKey)

async function resetAdmin() {
  try {
    const email = "admin@helix.com"
    const password = "kation25"

    const { data: authUsers, error: listError } = await supabase.auth.admin.listUsers()
    if (listError) throw listError

    const user = authUsers.users.find(u => u.email === email)
    if (!user) throw new Error("Admin user not found")

    console.log(`Setting password to "${password}" for admin user ID ${user.id}...`)
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      password: password
    })
    if (updateError) throw updateError
    console.log("Admin password reset successfully!")
  } catch (err) {
    console.error("Error:", err)
  }
}

resetAdmin()
