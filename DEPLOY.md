# Deploy — Gestão de Obra

Este projeto roda localmente com SQLite. Para colocar no ar (URL pública, acessível
de qualquer lugar), o caminho mais simples é **Vercel + Postgres gerenciado**
(Neon ou Supabase, ambos têm plano gratuito).

Você precisa ter (ou criar) conta nesses serviços — isso não pode ser feito por
mim, só por você diretamente nos sites deles.

## 1. Banco de dados Postgres

1. Crie um banco gratuito em [neon.tech](https://neon.tech) ou
   [supabase.com](https://supabase.com).
2. Copie a **connection string** (algo como
   `postgresql://usuario:senha@host/banco?sslmode=require`).

## 2. Trocar o provider do Prisma

Em `prisma/schema.prisma`, troque:

```prisma
datasource db {
  provider = "sqlite"
}
```

por:

```prisma
datasource db {
  provider = "postgresql"
}
```

E troque o driver adapter em `src/lib/prisma.ts` e `prisma/seed.ts`
(de `@prisma/adapter-better-sqlite3` para `@prisma/adapter-pg`, com
`npm install @prisma/adapter-pg pg`) — o padrão está documentado no skill
`prisma-database-setup` que já está no projeto (`.agents/skills/`).

## 3. Rodar a migração no banco novo

```bash
DATABASE_URL="sua-connection-string" npx prisma migrate deploy
DATABASE_URL="sua-connection-string" npx prisma db seed
```

## 4. Fotos (upload)

Hoje as fotos do diário de obra são salvas em `public/uploads`. Isso funciona
localmente, mas **não funciona no Vercel** (o filesystem lá é somente leitura
e efêmero). Antes de ir para produção, troque `src/lib/uploads.ts` para usar
[Vercel Blob](https://vercel.com/docs/storage/vercel-blob) ou
[Supabase Storage](https://supabase.com/docs/guides/storage) em vez de
`fs.writeFile`.

## 5. Deploy no Vercel

1. Suba este repositório para o GitHub (ou GitLab/Bitbucket).
2. Em [vercel.com](https://vercel.com), importe o repositório.
3. Configure as variáveis de ambiente do projeto na Vercel:
   - `DATABASE_URL` — a connection string do Postgres
   - `SESSION_SECRET` — gere uma nova com `openssl rand -base64 32` (não reuse a de dev)
   - Variáveis do storage de fotos escolhido (ex: `BLOB_READ_WRITE_TOKEN`)
4. Deploy. A Vercel builda e publica automaticamente a cada push.

## 6. Usuário administrador em produção

O `prisma/seed.ts` cria um usuário admin (`SEED_ADMIN_EMAIL` /
`SEED_ADMIN_PASSWORD`, com padrão `admin@empresa.com` / `troque-esta-senha`
se não definidos). Defina essas variáveis antes de rodar o seed em produção,
e troque a senha assim que logar pela primeira vez.
