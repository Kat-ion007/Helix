const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Load environment variables from .env.local
const envPath = path.resolve(__dirname, ".env.local");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf8");
  content.split(/\r?\n/).forEach(line => {
    if (!line || line.startsWith("#")) return;
    const index = line.indexOf("=");
    if (index > 0) {
      const key = line.substring(0, index).trim();
      let val = line.substring(index + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.substring(1, val.length - 1);
      }
      process.env[key] = val;
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: tickets, error } = await supabase.from("ticket").select("id, title, status");
  if (error) {
    console.error(error);
  } else {
    console.log("=== Tickets ===");
    console.log(JSON.stringify(tickets, null, 2));
  }
}

run();
