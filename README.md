# InstaAuto

Respostas automáticas no Instagram, de graça e no seu próprio servidor. É uma alternativa aberta ao ManyChat:

- Alguém manda uma DM com uma palavra-chave e recebe a resposta na hora.
- Alguém comenta uma palavra-chave num post e recebe uma DM, com resposta pública no comentário.
- Botões de opção na DM para montar fluxos ("Quer o guia ou falar de projeto?").

Cada pessoa instala a própria cópia. Roda no plano gratuito da Vercel e do Supabase, e os dados ficam no seu banco. Ninguém além de você tem acesso.

Baseado no projeto [insta-p8](https://github.com/ayuuxh2/insta-p8) (licença MIT), adaptado para a API do Instagram com login unificado da Meta, com instalação simplificada e interface em português.

## Instalação (uns 30 minutos)

Você vai precisar de uma conta no GitHub, na Vercel e na Meta for Developers (a mesma do Facebook). Tudo grátis.

### 1. Conta profissional no Instagram

No app do Instagram: Configurações → Tipo de conta e ferramentas → mudar para **conta profissional** (Criador ou Empresa).

### 2. Botão de deploy

[![Deploy na Vercel](https://vercel.com/button)](__DEPLOY_URL__)

1. Clique no botão e entre na Vercel com o GitHub.
2. Quando pedir, crie o banco **Supabase** (plano grátis, região São Paulo). A Vercel liga o banco ao projeto sozinha.
3. Em `DASHBOARD_PASSWORD`, invente a senha do seu painel.
4. Clique em **Deploy** e espere uns 2 minutos. Anote o endereço do seu site, algo como `https://instaauto-seunome.vercel.app`.

As tabelas do banco são criadas sozinhas durante o deploy.

### 3. App na Meta

1. Acesse https://developers.facebook.com/apps → **Criar app**. Escolha o caso de uso **Gerenciar mensagens e conteúdo no Instagram**. Se pedir um portfólio empresarial, crie um com o seu nome.
2. Em **Casos de uso → Personalizar → API setup with Unified login**, passo 1, clique em **Criar nova configuração** e mantenha as opções padrão.
3. Em **Funções do app → Funções → Testadores do Instagram**, adicione o @ da sua conta. Aceite o convite no Instagram pela web: instagram.com → Configurações → Apps e sites → Convites de testador.
4. Em **Configurações do app → Básico**:
   - Em URL da política de privacidade, coloque `https://SEU-SITE.vercel.app/privacy`.
   - Copie a **Chave secreta do app** (botão Mostrar).

### 4. Tela de configuração

Abra o seu site. O navegador pede usuário e senha: o usuário pode ser qualquer um e a senha é a `DASHBOARD_PASSWORD`. A tela mostra 4 passos:

1. **Banco de dados:** já deve aparecer como pronto.
2. **Chave secreta:** cole a chave do passo 3.4 e salve.
3. **Webhook:** no app da Meta, em **API setup with Unified login → Configurar webhooks**, cole a URL e o token de verificação mostrados na tela. Clique em **Verificar e salvar** e assine os campos `comments`, `messages`, `messaging_postbacks` e `message_reactions`.
4. **Conectar:** no app da Meta, passo **Gerar tokens de acesso**, adicione a sua conta do Instagram, clique em **Gerar token** e copie. Cole o token na tela e clique em **Conectar**.

Pronto. Crie uma automação e teste a partir de **outra conta** do Instagram.

> Nunca mande o token nem a chave secreta para ninguém. Quem tiver os dois consegue mandar mensagens pela sua conta.

## Como as palavras-chave funcionam

- Não há limite de automações. Cada automação aceita várias palavras separadas por vírgula (`link, ebook, quero`).
- Acentos e maiúsculas não importam: `cafe` dispara com "CAFÉ".
- A palavra precisa aparecer inteira: `link` não dispara com "linkedin".
- Botões de opção: o texto do botão dispara a automação com a mesma palavra-chave. Exemplo de fluxo: uma DM com o botão **Guia** e outra automação de DM com a palavra-chave `guia`, que manda o link.
- Post em collab: o comentário chega para a conta **dona** do post. Crie a automação nela.

## Limites do Instagram (valem para qualquer ferramenta)

- Comentário: no máximo 1 DM por comentário, em até 7 dias.
- DM: você só pode responder dentro de 24 horas da última mensagem da pessoa.
- O app da Meta fica em modo de desenvolvimento, o que basta para a sua própria conta. Não é preciso enviar o app para revisão.

## Trocar ou adicionar outra conta

1. A conta nova precisa ser profissional e estar como testadora no app da Meta (passo 3.3).
2. Gere um token para ela no passo **Gerar tokens de acesso** e ligue a assinatura do webhook dela.
3. No painel, saia (seta ao lado do @, canto inferior esquerdo), cole o token novo e clique em **Conectar**.
4. Contas já conectadas aparecem como botões "Entrar como @...". Cada automação pertence à conta em que foi criada.

## Se algo der errado

- **Banco de dados não aparece como pronto:** no Supabase, abra **SQL Editor**, cole o arquivo [`schema.sql`](schema.sql) e clique em **Run**.
- **A DM não responde:** confira se a automação está ativa, se a conta que mandou a mensagem é outra conta e se os 4 campos do webhook estão assinados. Os registros ficam na Vercel → seu projeto → Logs.
- **"No Instagram account on this token":** preencha o campo "ID da conta do Instagram". O ID aparece no passo **Gerar tokens de acesso** da Meta, ao lado da conta.

## Instalação manual (sem o botão)

Variáveis de ambiente: veja [`.env.example`](.env.example). Rode o `schema.sql` no SQL Editor do Supabase e depois `pnpm install && pnpm build`.

## Licença

MIT. Veja [LICENSE](LICENSE).
