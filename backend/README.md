# APSKIB — Backend

API REST em Node.js + Express + TypeScript + Prisma + PostgreSQL para o site
da Associação Provincial de Sambo e Kurash do Icolo e Bengo.

## Stack

- **Node.js + Express + TypeScript**
- **PostgreSQL** com **Prisma ORM** (migrações + client tipado)
- **JWT** para autenticação de administradores (`jsonwebtoken` + `bcryptjs`)
- **Zod** para validação de dados de entrada
- **Multer** para upload de ficheiros (documentos e imagens)
- **express-rate-limit** para proteger endpoints públicos de escrita

> Nota: este projeto foi escrito neste ambiente sem acesso à internet, pelo
> que **não foi possível correr `npm install` nem testar a execução real
> aqui**. O código foi escrito e revisto com cuidado, mas corra os passos de
> verificação abaixo (`npm run build`, `npm run dev`, testar os endpoints)
> antes de dar como garantido que está tudo perfeito.

## Configuração inicial

### 1. Base de dados PostgreSQL

Opção A — Docker (mais simples, se tiver Docker Desktop instalado):

```bash
docker compose up -d
```

Isto sobe um PostgreSQL local em `localhost:5432` com utilizador/password
`apskib` / `apskib` e base de dados `apskib` — já corresponde ao
`DATABASE_URL` do `.env.example`.

Opção B — PostgreSQL instalado localmente, ou um serviço gratuito como
[Neon](https://neon.tech) ou [Supabase](https://supabase.com): crie uma base
de dados e ajuste o `DATABASE_URL` no `.env` em conformidade.

### 2. Variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` e, pelo menos, gere um `JWT_SECRET` novo:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 3. Instalar dependências

```bash
npm install
```

### 4. Criar as tabelas na base de dados

```bash
npm run prisma:migrate
```

(Vai pedir um nome para a migração — pode usar `init`.)

### 5. Semear dados iniciais

Cria as 3 modalidades, as 6 categorias etárias, a competição já anunciada no
site e a primeira conta de administrador (dados definidos no `.env`,
variáveis `ADMIN_SEED_*`):

```bash
npm run seed
```

### 6. Arrancar o servidor em desenvolvimento

```bash
npm run dev
```

A API fica disponível em `http://localhost:4000`. Teste com:

```bash
curl http://localhost:4000/api/health
curl http://localhost:4000/api/sports
```

## Scripts disponíveis

| Comando                 | Descrição                                          |
| ------------------------ | --------------------------------------------------- |
| `npm run dev`            | Arranca a API com recarregamento automático          |
| `npm run build`          | Compila TypeScript para `dist/`                      |
| `npm start`              | Corre a versão compilada (`dist/index.js`)            |
| `npm run lint`           | Corre o ESLint                                       |
| `npm run prisma:migrate` | Cria/aplica uma migração em desenvolvimento           |
| `npm run prisma:deploy`  | Aplica migrações existentes (usar em produção)        |
| `npm run prisma:studio`  | Abre o Prisma Studio (interface visual da BD)         |
| `npm run seed`           | Semeia os dados iniciais descritos acima             |

## Estrutura do projeto

```
prisma/
  schema.prisma      modelos da base de dados
  seed.ts             dados iniciais
src/
  app.ts              configuração do Express (middlewares, rotas)
  index.ts             arranque do servidor HTTP
  env.ts               leitura/validação das variáveis de ambiente
  lib/prisma.ts         instância partilhada do Prisma Client
  middleware/           autenticação, validação, upload, erros, rate limit
  routes/               um ficheiro por recurso (sports, athletes, news, ...)
  utils/                helpers (ApiError, asyncHandler, ...)
uploads/                ficheiros carregados (documentos e imagens)
```

## Endpoints principais

Todos os endpoints estão sob o prefixo `/api`.

### Públicos (sem autenticação)

- `GET /health`
- `GET /sports`, `GET /categories`
- `GET /clubs` (só aprovados) · `POST /clubs` (pedido de afiliação)
- `GET /athletes` (só aprovados, sem dados de contacto pessoais)
- `POST /registrations` (formulário de inscrição do site)
- `GET /competitions`
- `GET /results?competitionId=...`
- `GET /ranking?categoryId=...`
- `GET /news` · `GET /news/:slug`
- `GET /partners`
- `GET /documents`
- `GET /gallery`
- `POST /contact` (formulário de contacto do site)
- `POST /auth/login`

### Protegidos (precisam de `Authorization: Bearer <token>`, obtido no login)

- `GET /auth/me`
- CRUD completo (`POST` / `PUT` / `DELETE`) em `/sports`, `/categories`,
  `/competitions`, `/results`, `/ranking`, `/partners`, `/documents`,
  `/gallery`
- `GET /admin/clubs`, `PUT /admin/clubs/:id`, `PATCH /admin/clubs/:id/status`,
  `DELETE /admin/clubs/:id`
- `GET /admin/athletes`, `GET /admin/athletes/:id`, `PUT /admin/athletes/:id`,
  `PATCH /admin/athletes/:id/status`, `DELETE /admin/athletes/:id`
- `GET /admin/news` (inclui rascunhos), `POST /admin/news`,
  `PUT /admin/news/:id`, `DELETE /admin/news/:id`
- `GET /admin/contact`, `PATCH /admin/contact/:id/read`,
  `DELETE /admin/contact/:id`

Os endpoints de upload (`/partners`, `/documents`, `/gallery` no `POST`)
recebem `multipart/form-data` com o campo de ficheiro (`logo`, `file` ou
`image`, respetivamente) mais os restantes campos.

## Ligar o frontend a esta API

No projeto do frontend (`apskib`), adicione ao `.env` (crie o ficheiro, já
que o Vite lê variáveis com o prefixo `VITE_`):

```
VITE_API_URL=http://localhost:4000/api
```

E use o `axios` (já está instalado no frontend) para substituir os dados
fixos em `src/data/content.ts` por chamadas a estes endpoints. Posso ajudar
nesse próximo passo quando quiser.

## Segurança — antes de publicar em produção

- Gere um `JWT_SECRET` forte e mantenha-o fora do controlo de versões.
- Mude a password da conta de administrador criada pelo `seed` assim que
  fizer login pela primeira vez.
- Ajuste `CORS_ORIGIN` para o domínio real do site em produção.
- Considere mover os uploads (`/uploads`) para um serviço de armazenamento
  externo (ex: S3, Cloudflare R2) em vez de disco local, especialmente se o
  servidor correr em múltiplas instâncias ou em plataformas com sistema de
  ficheiros efémero (ex: Render, Railway sem volume persistente).
