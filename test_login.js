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
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY // Anon Key

if (!supabaseUrl || !supabaseKey) {
  console.error("Error: Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testLogin() {
  try {
    const email = "okwuidegbekate23@gmail.com"
    const password = "helix25"

    console.log(`Attempting login for ${email} with password: "${password}"...`)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Login failed with error:", error.message)
    } else {
      console.log("Login succeeded! Session user:", data.user.email)
    }

  } catch (err) {
    console.error("Unexpected error:", err)
  }
}

testLogin()
