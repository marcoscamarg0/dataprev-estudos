# DATAPREV Estudos

Plataforma de estudos para o concurso DATAPREV 2026 (FGV) — dashboard, questões,
simulados, flashcards, cronograma, biblioteca de materiais e tutor de IA.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS + Radix UI
- Prisma + PostgreSQL
- Autenticação própria (JWT + cookie httpOnly + bcrypt)
- IA: [OpenRouter](https://openrouter.ai) com o modelo `nvidia/nemotron-3-ultra-550b-a55b:free`
- Gráficos: Recharts

## Configuração do zero

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

```bash
cp .env.example .env
```

- `DATABASE_URL` / `DIRECT_URL`: string de conexão PostgreSQL (pode usar
  [Supabase](https://supabase.com), [Neon](https://neon.tech) ou Postgres local).
- `JWT_SECRET`: qualquer string longa e aleatória (ex: `openssl rand -hex 32`).
- `OPENROUTER_API_KEY`: gerada em https://openrouter.ai/keys (necessária para o
  tutor de IA — a chave fica só no servidor, nunca é exposta no navegador).
- `OPENROUTER_MODEL`: já vem preenchida com o modelo gratuito da Nemotron.

### 3. Criar o banco de dados

```bash
npx prisma generate
npx prisma db push
```

### 4. Rodar

```bash
npm run dev
```

Abra http://localhost:3000 — você será redirecionado para `/login`. Clique em
"Criar conta" para se cadastrar (não há usuários pré-criados).

## Funcionalidades

- **Login/Cadastro** (`/login`, `/registro`): autenticação real com senha
  criptografada (bcrypt) e sessão via cookie JWT. Todas as rotas do dashboard
  são protegidas por middleware — sem login, redireciona automaticamente.
- **Biblioteca** (`/biblioteca`): upload real de arquivos de estudo (PDF, TXT,
  MD, etc.) ou links, com tags. Arquivos ficam em `public/uploads/{userId}/`.
  Arquivos de texto (`.txt`, `.md`, `.csv`, `.json`) têm o conteúdo extraído
  automaticamente para servir de contexto ao tutor de IA.
- **Tutor de IA** (`/ia`): conversa com a Nemotron via OpenRouter, com prompt
  especializado no edital da DATAPREV/FGV.
- **Estatísticas** (`/estatisticas`): gráficos (pizza, barras) de progresso e
  desempenho por matéria.
- **Dashboard, Questões, Simulados, Flashcards, Cronograma, Revisões, Metas,
  Conquistas**: já existentes no projeto original.

## Resetar o banco de dados

Para apagar tudo e recomeçar do zero:

```bash
npx prisma db push --force-reset
```

## Deploy

Funciona em qualquer plataforma que rode Next.js (Vercel, Railway, etc.).
Lembre-se de configurar as mesmas variáveis de ambiente do `.env` lá, e de que
o armazenamento de arquivos em `public/uploads` é local ao servidor — em
produção com múltiplas instâncias, migre para um storage externo (ex:
Supabase Storage, já incluso como dependência do projeto).
