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

async function inviteUser() {
  try {
    const email = "okwuidegbekate23@gmail.com"
    const name = "Kation"
    const role = "agent"

    console.log(`Sending invite to ${email}...`)
    
    // 1. Invite in Auth
    const { data: authUser, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: { name },
      redirectTo: "http://localhost:3000/set-password"
    })

    if (inviteError) throw inviteError
    console.log("Auth user invited successfully:", authUser.user.id)

    // 2. Insert into public.user table
    const { data: newProfile, error: dbError } = await supabase
      .from("user")
      .insert({
        id: authUser.user.id,
        name,
        email,
        role,
        status: "invited"
      })
      .select()
      .single()

    if (dbError) {
      await supabase.auth.admin.deleteUser(authUser.user.id)
      throw dbError
    }

    console.log("Public profile created successfully:", newProfile)
  } catch (err) {
    console.error("Error inviting user:", err)
  }
}

inviteUser()
