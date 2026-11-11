import { NextResponse, type NextRequest } from "next/server"

// The app has no real auth: API routes trust a userId from the browser and use the
// Supabase service-role key. For a single-owner deploy, gate everything behind one password.
// ponytail: HTTP Basic Auth, swap for real sessions if more than one person ever logs in.
export function proxy(request: NextRequest) {
  const password = process.env.DASHBOARD_PASSWORD
  if (!password) return new NextResponse("DASHBOARD_PASSWORD not set", { status: 503 })

  const header = request.headers.get("authorization") ?? ""
  const [scheme, encoded] = header.split(" ")
  if (scheme === "Basic" && encoded) {
    const pass = atob(encoded).split(":").slice(1).join(":")
    if (pass === password) return NextResponse.next()
  }
  return new NextResponse("Auth required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="InstaAuto"' },
  })
}

export const config = {
  // Public: Meta webhook (signed with app secret), privacy page (Meta requires it), static files.
  matcher: ["/((?!api/instagram/webhook|privacy|_next/|favicon|.*\\.(?:png|jpg|jpeg|svg|ico|webp)$).*)"],
}
