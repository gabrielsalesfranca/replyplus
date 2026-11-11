// Run: node lib/keyword-match.check.ts
import assert from "node:assert/strict"
import { keywordMatches as m } from "./keyword-match.ts"

assert.ok(m("café", "quero café!"))
assert.ok(m("olá", "Olá"))
assert.ok(m("cafe", "quero CAFÉ"))
assert.ok(m("café", "quero cafe"))
assert.ok(m("link, ebook", "manda o EBOOK"))
assert.ok(m("eu quero", "Eu quero!"))
assert.ok(!m("link", "linkedin"))
assert.ok(!m("sim", "assim"))
assert.ok(!m("ão", "não"))
assert.ok(!m(" , ", "qualquer"))
console.log("keyword-match ok")
