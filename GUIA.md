# Guia de instalação (uso próprio)

Tudo roda no plano gratuito do Supabase e da Vercel. Você vai precisar de três contas: Supabase, Vercel e Meta for Developers (a mesma do Facebook). Cada login e senha é seu; o Claude não digita senhas.

Ordem: Supabase → Vercel (para ganhar o endereço do site) → Meta (que precisa desse endereço) → variáveis na Vercel → login → primeira automação.

## 1. Instagram

No app do Instagram: Configurações → Tipo de conta e ferramentas → mudar para conta **Profissional** (Criador ou Empresa).

## 2. Supabase (banco de dados)

1. Crie um projeto em https://supabase.com/dashboard (região São Paulo).
2. Menu lateral → **SQL Editor** → New query → cole todo o arquivo `schema.sql` → **Run**.
3. Opcional: Database → Extensions → ative `pg_cron` e rode o comando de limpeza do `SUPABASE_SETUP.md`.
4. Project Settings → API. Anote:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (secreta, nunca compartilhe)

## 3. Vercel (hospedagem)

1. No terminal, nesta pasta: `npx vercel login` (você faz o login).
2. Depois peça ao Claude para rodar o deploy, ou rode `npx vercel --prod`.
3. Anote o endereço final, por exemplo `https://instaauto-seunome.vercel.app`.

## 4. Meta for Developers (o app que fala com o Instagram)

1. https://developers.facebook.com/apps → **Criar app** → caso de uso "Gerenciar mensagens e conteúdo no Instagram".
2. No app: Instagram → **Configuração da API com login do Instagram**.
   - Anote **ID do app do Instagram** e **Chave secreta do app do Instagram** (não use o ID do app Meta em Configurações → Básico).
3. Em "Configurar login comercial do Instagram", adicione a URL de redirecionamento OAuth:
   `https://SEU-ENDERECO.vercel.app/api/instagram/callback`
4. Em "Configurar webhooks":
   - URL de callback: `https://SEU-ENDERECO.vercel.app/api/instagram/webhook`
   - Token de verificação: invente uma frase qualquer (vai em `INSTAGRAM_WEBHOOK_VERIFY_TOKEN`)
   - Assine os campos: `comments`, `messages`, `messaging_postbacks`, `message_reactions`
5. Funções do app → Funções → **Testadores do Instagram** → adicione o seu @. Aceite o convite no Instagram: Configurações → Apps e sites → Convites de testador.
6. Configurações → Básico: preencha a URL da política de privacidade com `https://SEU-ENDERECO.vercel.app/privacy`.

## 5. Variáveis na Vercel

Vercel → seu projeto → Settings → Environment Variables. Preencha:

| Variável | Valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | do passo 2 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | do passo 2 |
| `SUPABASE_SERVICE_ROLE_KEY` | do passo 2 |
| `NEXT_PUBLIC_INSTAGRAM_APP_ID` | ID do app do Instagram |
| `INSTAGRAM_APP_ID` | o mesmo ID |
| `INSTAGRAM_APP_SECRET` | chave secreta do app do Instagram |
| `NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI` | `https://SEU-ENDERECO.vercel.app/api/instagram/callback` |
| `INSTAGRAM_WEBHOOK_VERIFY_TOKEN` | a frase do passo 4 |
| `DASHBOARD_PASSWORD` | senha do seu painel (escolha uma forte) |

Depois, faça um novo deploy para as variáveis valerem.

## 6. Usar

1. Abra o endereço. O navegador pede usuário e senha: usuário qualquer, senha = `DASHBOARD_PASSWORD`.
2. Entre com o Instagram e crie uma automação.
3. Teste com **outra conta** do Instagram: mande uma DM com a palavra-chave e comente num post.

## Palavras-chave

- Sem limite de quantidade. Cada automação aceita várias palavras separadas por vírgula (`link, ebook, quero`), e você pode ter quantas automações quiser.
- Acentos e maiúsculas não importam: `cafe` dispara com "CAFÉ".
- A palavra precisa aparecer inteira: `link` não dispara com "linkedin".
- Se duas automações servem para a mesma mensagem, só uma responde. Num comentário, a prioridade é: regra do post específico, depois regra geral.

## Limites do Instagram (valem para qualquer ferramenta)

- Comentário: no máximo 1 DM privada por comentário, em até 7 dias.
- DM: você só pode responder dentro de 24 h da última mensagem da pessoa.
- **Comentários e modo de desenvolvimento:** a documentação da Meta diz que o webhook de `comments` exige **Advanced Access** e app publicado (Live), mas a página de revisão diz que app só para negócio próprio com Standard Access não precisa de revisão. As duas páginas se contradizem. Teste primeiro: se as DMs funcionarem e os comentários não chegarem, será preciso pedir Advanced Access de `instagram_business_manage_comments` na revisão de app (gratuita, pede um vídeo de tela mostrando o uso).

## O que foi mudado em relação ao projeto original

- `proxy.ts`: senha no painel. O original não tinha login de verdade; qualquer um com seu ID poderia mandar DMs pelo seu perfil.
- `lib/keyword-match.ts`: palavras com acento ("olá", "café") não funcionavam. Teste: `node lib/keyword-match.check.ts`.
- Removidos `.mcp.json` e `.codex`, que apontavam para os bancos do autor original.
