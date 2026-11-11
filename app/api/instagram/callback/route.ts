import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase-server"
import { GRAPH, igIdFor } from "@/lib/instagram-api"

// Instagram API with Unified Login, single owner: no OAuth. The owner generates a
// System User Access Token in the Meta dashboard and sets it as IG_ACCESS_TOKEN.
// This route registers that account and subscribes it to webhooks. A token pasted in the
// login screen (body.token) wins over the env var, so switching accounts needs no redeploy.
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const accessToken = (typeof body?.token === "string" && body.token.trim()) || process.env.IG_ACCESS_TOKEN
    if (!accessToken) throw new Error("IG_ACCESS_TOKEN not set")
    const q = `access_token=${encodeURIComponent(accessToken)}`

    const explicitId = typeof body?.igId === "string" ? body.igId.replace(/\D/g, "") : ""
    const igId = explicitId || (await igIdFor(accessToken))
    const me = await fetch(`${GRAPH}/${igId}?fields=username,profile_picture_url&${q}`).then((r) => r.json()).catch(() => ({}))
    // With a typed-in id, refuse to save unless the token can actually read that account.
    if (explicitId && !me?.username) throw new Error(`token can't access account ${igId}: ${JSON.stringify(me?.error ?? me)}`)
    const username: string = me?.username || `user_${igId}`
    const profilePic: string | null = me?.profile_picture_url || null

    const sub = await fetch(`${GRAPH}/${igId}/subscribed_apps?subscribed_fields=comments,messages,messaging_postbacks,message_reactions&${q}`, { method: "POST" })
      .then((r) => r.json())
      .catch((e) => ({ error: String(e) }))
    console.log("[token-login] webhook subscription:", JSON.stringify(sub))

    const supabase = await getSupabaseServerClient()
    const { error: upsertError } = await supabase.from("users").upsert(
      {
        id: igId,
        username,
        access_token: accessToken,
        token_expires_at: null, // system-user tokens don't expire
        updated_at: new Date().toISOString(),
        business_account_id: igId,
        page_id: igId,
      },
      { onConflict: "id" },
    )
    if (upsertError) throw upsertError

    const response = NextResponse.json({ success: true, username, userId: igId, profilePic, webhooks: sub })
    response.cookies.set("insta_session", JSON.stringify({ username, userId: igId }), {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })
    return response
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
