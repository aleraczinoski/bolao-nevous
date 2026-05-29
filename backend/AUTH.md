# Autenticação — JWT + Passport

## O que foi implementado

O sistema usa **JWT** para autenticação stateless e **bcryptjs** para hash de senha. A integração segue o padrão oficial do NestJS com `@nestjs/passport` e `passport-jwt`.

### Arquivos modificados / criados

| Arquivo | O que mudou |
|---|---|
| `src/auth/crypto.ts` | Substituído `scryptSync` (Node crypto) por `bcryptjs` async |
| `src/auth/jwt.strategy.ts` | **Novo** — `JwtStrategy` que valida o token Bearer via Passport |
| `src/auth/jwt-auth.guard.ts` | Simplificado para `extends AuthGuard('jwt')` |
| `src/auth/optional-jwt-auth.guard.ts` | Mesmo padrão, mas retorna `null` em vez de lançar erro (rotas públicas que aceitam usuário opcional) |
| `src/auth/auth.module.ts` | Adicionado `PassportModule` e `JwtStrategy` nos providers |
| `src/auth/auth.service.ts` | Adicionado `await` nas chamadas de hash/verify que viraram async |

### Fluxo de autenticação

```
POST /auth/register  →  hash(senha) via bcryptjs  →  salva User no Prisma  →  retorna JWT
POST /auth/login     →  bcrypt.compare(senha, hash)  →  retorna JWT
GET  /auth/me        →  JwtAuthGuard valida Bearer token  →  retorna perfil
```

O token JWT carrega o payload `{ sub, email, role, displayName }` e expira em **7 dias**.

---

## Como testar

### Pré-requisitos

- PostgreSQL rodando
- Arquivo `.env` com as variáveis:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/bolao"
JWT_SECRET="uma-chave-com-no-minimo-32-caracteres-aqui"
```

### Subir o servidor

```bash
cd backend
pnpm start:dev
```

### Rodar a migration (se ainda não foi aplicada)

```bash
cd backend
pnpm prisma migrate dev
```

---

### Testes manuais no Postman

#### 1. Cadastro

- **Method:** `POST`
- **URL:** `http://localhost:3000/auth/register`
- **Body** → selecione `raw` + `JSON`:

```json
{
  "email": "teste@email.com",
  "displayName": "Teste",
  "password": "senha123"
}
```

Resposta esperada (`200`):
```json
{
  "accessToken": "<jwt>",
  "user": {
    "id": "...",
    "email": "teste@email.com",
    "displayName": "Teste",
    "role": "USER",
    "active": true,
    "createdAt": "..."
  }
}
```

> Copie o valor de `accessToken` — ele será usado nas requisições protegidas.

---

#### 2. Login

- **Method:** `POST`
- **URL:** `http://localhost:3000/auth/login`
- **Body** → `raw` + `JSON`:

```json
{
  "email": "teste@email.com",
  "password": "senha123"
}
```

Resposta esperada (`200`): mesmo formato do cadastro, com um novo `accessToken`.

---

#### 3. Perfil (rota protegida)

- **Method:** `GET`
- **URL:** `http://localhost:3000/auth/me`
- **Authorization** → tipo `Bearer Token` → cole o `accessToken` no campo **Token**

Resposta esperada (`200`): objeto com os dados do usuário logado.

---

#### 4. Sem token — deve retornar 401

- **Method:** `GET`
- **URL:** `http://localhost:3000/auth/me`
- **Authorization** → `No Auth`

Resposta esperada:
```json
{ "statusCode": 401, "message": "Unauthorized" }
```

---

#### 5. Verificar hash bcrypt no banco

```bash
pnpm prisma studio
```

Abra a tabela `User` e confirme que `passwordHash` começa com `$2b$` (prefixo do bcrypt).

---

### Proteger outras rotas

Para proteger qualquer endpoint do sistema, basta adicionar o guard:

```typescript
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';

@UseGuards(JwtAuthGuard)
@Get('rota-protegida')
minhaRota(@Request() req) {
  return req.user; // { sub, email, role, displayName }
}
```

Para rotas que aceitam usuário logado **ou** anônimo, use `OptionalJwtAuthGuard` no lugar.
