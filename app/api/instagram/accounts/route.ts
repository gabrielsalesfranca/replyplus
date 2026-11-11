import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase-server"

// Connected accounts for the login screen's account switcher. Behind the dashboard
// password (proxy.ts); tokens are never returned. Ids as text: they exceed JS Number precision.
export async function GET() {
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase.from("users").select("id:id::text, username").order("username")
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ accounts: data ?? [] })
}
