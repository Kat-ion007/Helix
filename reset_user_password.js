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

async function resetPassword() {
  try {
    const email = "okwuidegbekate23@gmail.com"
    const password = "helix25"

    // Find user ID
    const { data: authUsers, error: listError } = await supabase.auth.admin.listUsers()
    if (listError) throw listError

    const user = authUsers.users.find(u => u.email === email)
    if (!user) throw new Error("User not found")

    console.log(`Setting password to "${password}" for user ID ${user.id} (${email})...`)
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      password: password
    })

    if (updateError) throw updateError
    console.log("Password updated successfully via admin client!")

    // Now test sign in with anon client
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!anonKey) throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY in environment")
    const anonClient = createClient(supabaseUrl, anonKey)
    const { data, error } = await anonClient.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Sign in failed:", error.message)
    } else {
      console.log("Sign in succeeded! User:", data.user.email)
    }

  } catch (err) {
    console.error("Error:", err)
  }
}

resetPassword()
