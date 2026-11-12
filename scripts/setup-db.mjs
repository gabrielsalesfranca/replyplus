// Runs before `next build`: applies schema.sql (idempotent) when a direct Postgres URL exists.
// The Supabase integration on Vercel sets POSTGRES_URL_NON_POOLING; without it, nothing happens.
import fs from "node:fs"
import pg from "pg"

const url = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL
if (!url) {
  console.log("[setup-db] no POSTGRES_URL, skipping (run schema.sql in the Supabase SQL editor)")
  process.exit(0)
}

// Supabase serves a cert Node doesn't trust by default; drop sslmode from the URL so `ssl` below applies.
const client = new pg.Client({
  connectionString: url.replace(/[?&]sslmode=[^&]*/, ""),
  ssl: { rejectUnauthorized: false },
})
try {
  await client.connect()
  await client.query(fs.readFileSync("schema.sql", "utf8"))
  console.log("[setup-db] schema.sql applied")
} catch (e) {
  // Don't fail the deploy: the setup screen shows the database status and how to fix it.
  console.warn("[setup-db] could not apply schema.sql:", e.message)
} finally {
  await client.end().catch(() => {})
}
