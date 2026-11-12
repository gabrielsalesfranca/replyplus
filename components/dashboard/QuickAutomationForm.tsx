"use client"

import { useRef, useState } from "react"
import { Loader2 } from "lucide-react"
import type { Automation } from "@/lib/types"
import { PostSelector, InstagramMediaItem } from "@/components/dashboard/PostSelector"

type Source = Automation["trigger_source"]

export function QuickAutomationForm({ userId, initialSource, onSuccess }: {
  userId: string
  initialSource: Source
  onSuccess: (source: Source) => void
}) {
  const [source, setSource] = useState<Source>(initialSource)
  const [keyword, setKeyword] = useState("")
  const [answer, setAnswer] = useState("")
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null)
  const [selectedMedia, setSelectedMedia] = useState<InstagramMediaItem | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const submitting = useRef(false)

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting.current || !keyword.trim() || !answer.trim()) return
    submitting.current = true
    setSaving(true)
    setError("")
    try {
      const response = await fetch("/api/automations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          name: "Resposta para " + keyword.trim(),
          trigger_source: source,
          trigger_type: source === "story" ? "reply" : "keyword",
          trigger_value: keyword.trim(),
          content: { message: answer.trim(), ...(source === "comment" ? { reply_mode: "dm_only" } : {}) },
          specific_media_id: source === "comment" ? selectedMediaId : null,
        }),
      })
      if (!response.ok) throw new Error("Não foi possível salvar. Tente novamente.")
      setKeyword("")
      setAnswer("")
      setSelectedMediaId(null)
      setSelectedMedia(null)
      onSuccess(source)
    } catch {
      setError("Não foi possível salvar. Verifique sua conexão e tente novamente.")
    } finally {
      submitting.current = false
      setSaving(false)
    }
  }

  return <form onSubmit={save} className="overflow-hidden rounded-xl border border-border bg-card">
    <fieldset disabled={saving} className="min-w-0">
      <label className="flex items-center gap-3 border-b border-border px-4 py-3">
        <span className="shrink-0 text-xs text-muted-foreground">Responder a</span>
        <select
          value={source}
          onChange={event => {
            const next = event.target.value as Source
            setSource(next)
            if (next !== "comment") {
              setSelectedMediaId(null)
              setSelectedMedia(null)
            }
          }}
          className="rounded-md bg-card py-1 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="dm">Mensagens diretas (DM)</option>
          <option value="comment">Comentários em posts</option>
          <option value="story">Respostas aos stories</option>
        </select>
      </label>

      {source === "comment" && (
        <div className="border-b border-border bg-muted/20 p-4 sm:p-5">
          <div className="mb-3">
            <p className="text-sm font-medium text-foreground">Escolha onde isso funciona</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Aplique esta resposta a todos os posts/reels ou escolha um post ou reel específico.
            </p>
          </div>
          <PostSelector
            userId={userId}
            selectedMediaId={selectedMediaId}
            onSelect={(id, item) => {
              setSelectedMediaId(id)
              setSelectedMedia(item)
            }}
          />
        </div>
      )}

      <div className="grid sm:grid-cols-[1fr_2fr]">
        <label className="block border-b border-border p-4 sm:border-b-0 sm:border-r">
          <span className="text-xs font-medium text-muted-foreground">Quando disserem</span>
          <input
            required
            value={keyword}
            onChange={event => setKeyword(event.target.value)}
            placeholder="ex.: preço"
            className="mt-2 w-full rounded-sm bg-card py-1 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        <label className="block p-4">
          <span className="text-xs font-medium text-muted-foreground">Enviar esta resposta</span>
          <textarea
            required
            maxLength={1000}
            rows={3}
            value={answer}
            onChange={event => setAnswer(event.target.value)}
            placeholder="Nossos planos começam em R$ 49. Aqui está o link…"
            className="mt-2 w-full resize-y rounded-sm bg-card py-1 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-border px-4 py-3">
        <p className="text-xs text-muted-foreground">
          {source === "comment"
            ? selectedMediaId
              ? "Dispara só no post selecionado · Resposta enviada por DM"
              : "Dispara em qualquer post ou reel · Resposta enviada por DM"
            : source === "story"
            ? "Busca palavras-chave nas respostas aos stories"
            : "Busca palavras-chave nas DMs recebidas"}
        </p>
        <button
          disabled={saving || !keyword.trim() || !answer.trim()}
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {saving && <Loader2 className="size-4 animate-spin" />}
          {saving ? "Salvando…" : "Salvar resposta"}
        </button>
      </div>
      {error && <p role="alert" className="px-4 pb-3 text-sm text-destructive">{error}</p>}
    </fieldset>
  </form>
}
