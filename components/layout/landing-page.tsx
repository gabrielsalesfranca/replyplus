"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Check, Copy, Loader2, Zap } from "lucide-react"

type Setup = { dbReady: boolean; hasSecret?: boolean; verifyToken?: string; error?: string }

// First screen of a self-hosted install: finish setup, then connect an Instagram account.
export function LandingPage() {
  const router = useRouter()
  const [setup, setSetup] = useState<Setup | null>(null)
  const [secret, setSecret] = useState("")
  const [editSecret, setEditSecret] = useState(false)
  const [token, setToken] = useState("")
  const [igId, setIgId] = useState("")
  const [accounts, setAccounts] = useState<{ id: string; username: string }[]>([])
  const [origin, setOrigin] = useState("")
  const busy = useRef(false)
  const [loading, setLoading] = useState(false)

  const loadSetup = () => fetch("/api/setup").then((r) => r.json()).then(setSetup).catch((e) => setSetup({ dbReady: false, error: String(e) }))

  useEffect(() => {
    setOrigin(window.location.origin)
    loadSetup()
    fetch("/api/instagram/accounts").then((r) => r.json()).then((d) => setAccounts(d.accounts ?? [])).catch(() => {})
  }, [])

  const saveSecret = async () => {
    const res = await fetch("/api/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appSecret: secret }),
    }).then((r) => r.json())
    if (res.error) return alert(res.error)
    setSecret("")
    setEditSecret(false)
    loadSetup()
  }

  // Already-connected account: its token is saved, so switching is just picking the session.
  const enterAs = (a: { id: string; username: string }) => {
    localStorage.setItem("ig_user_id", a.id)
    localStorage.setItem("ig_username", a.username)
    localStorage.removeItem("ig_profile_pic")
    router.push("/dashboard")
  }

  const handleLogin = async () => {
    if (busy.current) return // a double click fired two logins; the second one failed on the same row
    busy.current = true
    setLoading(true)
    const data = await fetch("/api/instagram/callback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: token.trim(), igId: igId.trim() }),
    })
      .then((r) => r.json())
      .catch((e) => ({ error: String(e) }))
      .finally(() => { busy.current = false; setLoading(false) })
    if (!data.success) return alert(`Não foi possível conectar: ${data.error}`)
    localStorage.setItem("ig_user_id", data.userId)
    localStorage.setItem("ig_username", data.username)
    if (data.profilePic) localStorage.setItem("ig_profile_pic", data.profilePic)
    router.push("/dashboard")
  }

  const input = "w-full bg-black border border-white/15 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#ffe14d]"
  const button = "bg-white text-black font-bold text-sm rounded-lg px-4 py-2.5 hover:bg-[#ffe14d] disabled:opacity-40 transition-colors"

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#ededed] antialiased">
      <div className="max-w-xl mx-auto px-4 py-12 space-y-6">
        <header className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#ffe14d] text-black flex items-center justify-center rounded-lg">
            <Zap className="w-4 h-4" strokeWidth={2.5} />
          </div>
          <h1 className="text-xl font-bold">ReplyPlus</h1>
        </header>
        <p className="text-neutral-400 text-sm">
          Respostas automáticas no Instagram por palavra-chave, na DM e nos comentários. Esta instalação é sua: os dados
          ficam no seu banco.
        </p>

        {!setup && <Loader2 className="w-5 h-5 animate-spin text-neutral-500" />}

        {setup && (
          <>
            <Step n={1} title="Banco de dados" done={setup.dbReady}>
              {setup.dbReady ? (
                <p>Pronto.</p>
              ) : (
                <p>
                  As tabelas ainda não existem. No Supabase, abra <b>SQL Editor</b>, cole o arquivo <code>schema.sql</code>{" "}
                  do projeto e clique em <b>Run</b>. Depois recarregue esta página.
                  <span className="block mt-2 text-xs text-neutral-500">Detalhe: {setup.error}</span>
                </p>
              )}
            </Step>

            <Step n={2} title="Chave secreta do app da Meta" done={Boolean(setup.hasSecret) && !editSecret}>
              {setup.hasSecret && !editSecret ? (
                <p>
                  Salva.{" "}
                  <button className="underline text-neutral-400" onClick={() => setEditSecret(true)}>Trocar</button>
                </p>
              ) : (
                <>
                  <p>Meta for Developers → seu app → Configurações do app → Básico → Chave secreta do app → Mostrar.</p>
                  <div className="flex gap-2 mt-3">
                    <input type="password" className={input} placeholder="Cole a chave secreta" value={secret}
                      onChange={(e) => setSecret(e.target.value)} disabled={!setup.dbReady} />
                    <button className={button} onClick={saveSecret} disabled={!secret.trim()}>Salvar</button>
                  </div>
                </>
              )}
            </Step>

            <Step n={3} title="Webhook na Meta">
              <p>No app da Meta, em <b>Configurar webhooks</b>, cole estes dois valores, clique em Verificar e salvar e assine
                os campos <code>comments</code>, <code>messages</code>, <code>messaging_postbacks</code> e{" "}
                <code>message_reactions</code>.</p>
              <CopyField label="URL de callback" value={`${origin}/api/instagram/webhook`} />
              <CopyField label="Token de verificação" value={setup.verifyToken ?? "—"} />
            </Step>

            <Step n={4} title="Conectar a conta do Instagram">
              {accounts.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {accounts.map((a) => (
                    <button key={a.id} className={button} onClick={() => enterAs(a)}>Entrar como @{a.username}</button>
                  ))}
                </div>
              )}
              <p>Cole o token gerado no app da Meta (API setup with Unified login → Gerar token).</p>
              <input id="ig-token" type="password" className={`${input} mt-3`} placeholder="Token de acesso" value={token}
                onChange={(e) => setToken(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && token.trim()) handleLogin() }} />
              <input className={`${input} mt-2`} placeholder="ID da conta do Instagram (só se der erro sem ele)" value={igId}
                onChange={(e) => setIgId(e.target.value)} inputMode="numeric" />
              <button className={`${button} mt-3 w-full flex items-center justify-center gap-2`} onClick={handleLogin}
                disabled={loading || !setup.dbReady || !setup.hasSecret}>
                {loading && <Loader2 className="w-4 h-4 animate-spin" />} Conectar
              </button>
            </Step>
          </>
        )}
      </div>
    </div>
  )
}

function Step({ n, title, done, children }: { n: number; title: string; done?: boolean; children: React.ReactNode }) {
  return (
    <section className="border border-white/10 rounded-xl p-5 text-sm text-neutral-300 leading-relaxed">
      <h2 className="flex items-center gap-2 font-bold text-[#ededed] mb-2">
        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${done ? "bg-[#ffe14d] text-black" : "border border-white/20"}`}>
          {done ? <Check className="w-3.5 h-3.5" /> : n}
        </span>
        {title}
      </h2>
      {children}
    </section>
  )
}

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="mt-3">
      <div className="text-xs text-neutral-500 mb-1">{label}</div>
      <div className="flex gap-2">
        <code className="flex-1 bg-black border border-white/15 rounded-lg px-3 py-2.5 text-xs break-all">{value}</code>
        <button className="border border-white/15 rounded-lg px-3 hover:border-[#ffe14d]" aria-label={`Copiar ${label}`}
          onClick={() => navigator.clipboard.writeText(value).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500) })}>
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )
}
