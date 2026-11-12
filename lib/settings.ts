import crypto from "crypto"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

// Env var wins (existing deploys); otherwise the value saved on the setup screen.
const ENV: Record<string, string | undefined> = {
  meta_app_secret: process.env.META_APP_SECRET || process.env.INSTAGRAM_APP_SECRET,
  webhook_verify_token: process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN,
}
const cache = new Map<string, string>()

export async function getSetting(key: string): Promise<string | null> {
  if (ENV[key]) return ENV[key]!
  if (cache.has(key)) return cache.get(key)!
  const { data } = await getSupabaseAdmin().from("app_settings").select("value").eq("key", key).maybeSingle()
  if (data?.value) cache.set(key, data.value)
  return data?.value ?? null
}

export async function setSetting(key: string, value: string) {
  const { error } = await getSupabaseAdmin()
    .from("app_settings")
    .upsert({ key, value, updated_at: new Date().toISOString() })
  if (error) throw new Error(error.message)
  cache.set(key, value)
}

export async function getOrCreateVerifyToken(): Promise<string> {
  const existing = await getSetting("webhook_verify_token")
  if (existing) return existing
  const token = crypto.randomBytes(16).toString("hex")
  await setSetting("webhook_verify_token", token)
  return token
}
