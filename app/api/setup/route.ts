import { NextResponse } from "next/server"
import { getSetting, getOrCreateVerifyToken, setSetting } from "@/lib/settings"

// Setup screen state. Behind the dashboard password (proxy.ts); never returns the app secret itself.
export async function GET() {
  try {
    const verifyToken = await getOrCreateVerifyToken()
    const hasSecret = Boolean(await getSetting("meta_app_secret"))
    return NextResponse.json({ dbReady: true, hasSecret, verifyToken })
  } catch (e: any) {
    return NextResponse.json({ dbReady: false, error: e?.message ?? String(e) })
  }
}

export async function POST(request: Request) {
  const { appSecret } = await request.json().catch(() => ({}))
  const secret = typeof appSecret === "string" ? appSecret.trim() : ""
  if (!/^[0-9a-f]{32}$/i.test(secret)) {
    return NextResponse.json({ error: "A chave secreta tem 32 letras e números (0-9, a-f)." }, { status: 400 })
  }
  try {
    await setSetting("meta_app_secret", secret)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? String(e) }, { status: 500 })
  }
}
