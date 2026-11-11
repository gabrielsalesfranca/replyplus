// Strip accents + lowercase so "cafe" matches "café" and vice versa (PT-BR users often skip accents).
const norm = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase()
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

// Comma-separated keywords, whole-word match. Unicode-aware boundaries: JS `\b` treats
// accented letters as non-word, so "olá" / "café" never matched with the old regex.
export function keywordMatches(triggerValue: string, text: string): boolean {
  const t = norm(text)
  return triggerValue
    .split(",")
    .map((k) => norm(k.trim()))
    .filter(Boolean)
    .some((k) => new RegExp(`(?<![\\p{L}\\p{N}_])${escape(k)}(?![\\p{L}\\p{N}_])`, "u").test(t))
}
