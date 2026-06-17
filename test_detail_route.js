const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Load environment variables from .env.local
const envPath = "c:\\Users\\Kate\\Desktop\\Helix\\.env.local";
const content = fs.readFileSync(envPath, "utf8");
let url = "";
let anonKey = "";
content.split(/\r?\n/).forEach(line => {
  if (!line || line.startsWith("#")) return;
  const index = line.indexOf("=");
  if (index > 0) {
    const k = line.substring(0, index).trim();
    let v = line.substring(index + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.substring(1, v.length - 1);
    }
    if (k === "NEXT_PUBLIC_SUPABASE_URL") url = v;
    if (k === "NEXT_PUBLIC_SUPABASE_ANON_KEY") anonKey = v;
  }
});

const supabase = createClient(url, anonKey);

async function run() {
  try {
    console.log("Signing in as admin...");
    const { data, error } = await supabase.auth.signInWithPassword({
      email: "admin@helix.com",
      password: "kation25"
    });

    if (error) throw error;

    const accessToken = data.session.access_token;
    const refreshToken = data.session.refresh_token;

    const cookieName = "sb-fdcwabaubrkxaqbupjwr-auth-token";
    const sessionObj = {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: data.user,
      token_type: "bearer",
      expires_in: data.session.expires_in,
      expires_at: data.session.expires_at
    };
    const cookieValue = "base64-" + Buffer.from(JSON.stringify(sessionObj)).toString("base64");
    const cookieHeader = `${cookieName}=${encodeURIComponent(cookieValue)}`;

    const oldTicketId = "f2030303-3333-3333-3333-333333333333";
    const newTicketId = "684ca1db-3d46-4cf1-b4f4-c19205638a3a";

    console.log(`\nFetching OLD ticket detail route (/tickets/${oldTicketId})...`);
    const resOld = await fetch(`http://localhost:3000/tickets/${oldTicketId}`, {
      headers: { "Cookie": cookieHeader }
    });
    console.log("OLD Ticket Status:", resOld.status);

    console.log(`\nFetching NEW ticket detail route (/tickets/${newTicketId})...`);
    const resNew = await fetch(`http://localhost:3000/tickets/${newTicketId}`, {
      headers: { "Cookie": cookieHeader }
    });
    console.log("NEW Ticket Status:", resNew.status);

  } catch (err) {
    console.error("Error:", err);
  }
}

run();
