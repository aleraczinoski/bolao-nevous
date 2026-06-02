# Bolão Nevous — Docker: guia de uso

Este guia cobre como subir o ambiente de desenvolvimento local usando Docker.

## Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e rodando

---

## 1. Configurar variáveis de ambiente (primeira vez)

Abra o `docker-compose.yml` na raiz do projeto e ajuste as variáveis do serviço `backend` conforme necessário:

| Variável | O que é |
|----------|---------|
| `JWT_SECRET` | Chave secreta do JWT — troque por uma string longa e aleatória |
| `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` | Credenciais do servidor de e-mail (use [Mailtrap](https://mailtrap.io) para dev) |
| `SMTP_FROM` | Endereço remetente dos e-mails |

As credenciais do banco (`bolao_user`, `bolao_pass`, `bolao_db`) podem ser mantidas como estão para desenvolvimento local.

---

## 2. Subir os containers

```bash
docker compose up -d --build
```

Na primeira vez, o Docker vai baixar as imagens e construir a imagem do backend. Nas próximas vezes, o `--build` só reconstrói se algo mudou.

Para acompanhar os logs do backend em tempo real:

```bash
docker compose logs -f backend
```

Aguarde a mensagem `Application is running on: http://[::1]:3000` antes de continuar.

---

## 3. Rodar as migrations do Prisma (obrigatório na primeira vez)

Com os containers rodando, execute o comando abaixo para criar todas as tabelas no banco:

```bash
docker compose exec backend pnpm exec prisma migrate dev --name init
```

Para migrations subsequentes (depois de alterar o `schema.prisma`):

```bash
docker compose exec backend pnpm exec prisma migrate dev --name nome-da-migration
```

---

## 4. Verificar se está tudo funcionando

```bash
curl http://localhost:3000
```

A API deve responder. O banco de dados também está acessível localmente na porta `5432` com as seguintes credenciais:

| Campo | Valor |
|-------|-------|
| Host | `localhost` |
| Porta | `5432` |
| Usuário | `bolao_user` |
| Senha | `bolao_pass` |
| Banco | `bolao_db` |

---

## 5. Derrubar os containers

Parar e remover os containers, mas **mantendo os dados do banco**:

```bash
docker compose down
```

Parar, remover containers **e apagar o volume do banco** (reset completo):

```bash
docker compose down -v
```

---

## 6. Rebuildar após mudança de código

```bash
docker compose up -d --build backend
```

Só reconstrói e reinicia o serviço de backend, sem mexer no banco.
