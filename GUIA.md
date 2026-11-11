# Guia de instalação (uso próprio)

Tudo roda no plano gratuito do Supabase e da Vercel. Você vai precisar de três contas: Supabase, Vercel e Meta for Developers (a mesma do Facebook). Cada login e senha é seu; o Claude não digita senhas.

Ordem: Supabase → Vercel (para ganhar o endereço do site) → Meta → variáveis na Vercel → webhooks → primeira automação.

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

A Meta não oferece mais o "login do Instagram" para apps novos. Este projeto foi adaptado para a **API do Instagram com login unificado**, usando um token gerado no próprio painel da Meta. Não há tela de login com o Instagram.

1. https://developers.facebook.com/apps → **Criar app** → caso de uso **"Gerenciar mensagens e conteúdo no Instagram"** → portfólio empresarial **Gabriel Sales** (já feito).
2. Casos de uso → Personalizar → **API setup with Unified login** → passo **1. Configure seu app** → **Criar nova configuração**, mantendo as opções padrão (token de usuário do sistema, expiração "Nunca"). A URL de redirecionamento não é necessária.
3. **Funções do app** → Funções → **Testadores do Instagram** → adicione o seu @. Aceite o convite no Instagram pela web (instagram.com → Configurações → Apps e sites → Convites de testador).
4. Passo **2. Gerar tokens de acesso** → adicione a sua conta do Instagram → **Gerar token**. Copie o token e cole **você mesmo** na Vercel, na variável `IG_ACCESS_TOKEN` (passo 5). Nunca cole esse token no chat.
5. Configurações do app → **Básico** → copie a **Chave secreta do app** (botão "Mostrar"). Ela vai em `META_APP_SECRET`.
6. Configurações do app → Básico: em URL da política de privacidade, coloque `https://instaauto-three.vercel.app/privacy`.

## 5. Variáveis na Vercel

Vercel → projeto `instaauto` → Settings → Environment Variables. Preencha:

| Variável | Valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | do passo 2 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | do passo 2 |
| `SUPABASE_SERVICE_ROLE_KEY` | do passo 2 |
| `IG_ACCESS_TOKEN` | token gerado no passo 4.4 |
| `META_APP_SECRET` | chave secreta do app (passo 4.5) |
| `INSTAGRAM_WEBHOOK_VERIFY_TOKEN` | uma frase qualquer inventada por você |
| `DASHBOARD_PASSWORD` | senha do seu painel (escolha uma forte) |

Depois, faça um novo deploy para as variáveis valerem.

## 6. Webhooks e primeiro uso

1. No painel da Meta, passo **3. Configurar webhooks**:
   - URL de callback: `https://instaauto-three.vercel.app/api/instagram/webhook`
   - Token de verificação: a mesma frase de `INSTAGRAM_WEBHOOK_VERIFY_TOKEN`
   - Clique em **Verificar e salvar** e assine os campos `comments`, `messages`, `messaging_postbacks` e `message_reactions`.
2. Abra https://instaauto-three.vercel.app. O navegador pede usuário e senha: usuário qualquer, senha = `DASHBOARD_PASSWORD`.
3. Clique em **Connect Instagram**. O app lê o token, cadastra a sua conta e liga os webhooks dela.
4. Crie uma automação e teste com **outra conta** do Instagram: mande uma DM com a palavra-chave e comente num post.

### O que ainda não foi testado no login unificado

A documentação da Meta para o login unificado cobre envio de DM, resposta privada a comentário, resposta pública e webhooks. Estas funções extras usam endpoints que a documentação não confirma e serão conferidas no primeiro teste real:

- "Só libera o conteúdo se a pessoa seguir o perfil" (`is_user_follow_business`)
- Ice Breakers (perguntas prontas na DM, `messenger_profile`)
- Indicador "digitando…" e "visto" (`sender_action`)
- Buscar o @ de quem mandou a DM, usado na caixa de entrada

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

- Adaptado para a API do Instagram com login unificado (`graph.facebook.com` e token do painel em `IG_ACCESS_TOKEN`), porque a Meta não oferece mais o login do Instagram para apps novos.
- `proxy.ts`: senha no painel. O original não tinha login de verdade; qualquer um com seu ID poderia mandar DMs pelo seu perfil.
- `lib/keyword-match.ts`: palavras com acento ("olá", "café") não funcionavam. Teste: `node lib/keyword-match.check.ts`.
- Removidos `.mcp.json` e `.codex`, que apontavam para os bancos do autor original.

## Trocar de conta do Instagram

1. A conta nova precisa ser Profissional (Criador ou Empresa).
2. Meta → Funções do app → Adicionar pessoas → Testador do Instagram → @ da conta nova:
   https://developers.facebook.com/apps/29159315927024486/roles/roles/
3. Logado na conta nova, aceite o convite: https://www.instagram.com/accounts/manage_access/ → Convites de testador.
4. Meta → API setup with Unified login → passo 2 → Adicionar conta → entre na conta nova → Gerar token → Copiar. Ligue a "Assinatura do webhook" dela:
   https://developers.facebook.com/apps/29159315927024486/use_cases/customize/Unified-Login-API-Setup/?use_case_enum=INSTAGRAM_BUSINESS&business_id=259173361661536
5. No painel (https://instaauto-three.vercel.app/dashboard), desative as automações da conta antiga se não quiser que ela continue respondendo.
6. Clique em sair (seta ao lado do @, canto inferior esquerdo), cole o token no campo "Trocar de conta" e clique em Connect Instagram.
7. Crie as automações de novo: cada automação pertence à conta em que foi criada.
