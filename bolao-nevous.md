# Bolão Nevous

Bolão de futebol para a Copa do Mundo. Usuários fazem palpites de placar antes do início de cada partida e acumulam pontos conforme a precisão do palpite.

---

## Stack

| Camada | Tecnologia |
|--------|------------|
| Backend | NestJS + TypeScript |
| Banco | PostgreSQL via Prisma ORM |
| Frontend | React + Vite + Tailwind CSS |
| Auth | JWT (access token) + OTP por e-mail |
| Dados de jogos | [football-data.org](https://www.football-data.org/) API v4 |
| Deploy | Docker (backend) |

---

## Estrutura

```
bolao-nevous/
├── backend/
│   ├── prisma/schema.prisma
│   ├── scripts/recalcular-pontos.ts
│   └── src/
│       ├── auth/           # registro, login, perfil, OTP
│       ├── matches/        # listagem de partidas
│       ├── predictions/    # palpites e cálculo de pontos
│       ├── ranking/        # ranking geral
│       ├── admin/          # gestão de usuários e sync manual
│       └── results-sync/   # sync automático a cada 5 min
└── frontend/
    └── src/
        ├── Pages/
        │   ├── Dashboard.tsx     # palpites do usuário
        │   ├── Profile.tsx       # histórico e pontuação do usuário
        │   ├── Ranking.tsx       # ranking geral
        │   └── AdminPalpites.tsx # visão admin de todos os palpites
        └── services/api.ts
```

---

## Sistema de pontuação

Cada palpite é avaliado ao fim da partida. Os pontos se acumulam:

| Conquista | Pontos |
|-----------|--------|
| Acertou o vencedor (ou empate) | +1 (base) |
| Placar exato | +5 |
| Placar do vencedor correto | +3 |
| Diferença de gols correta | +2 |
| Placar do perdedor correto | +1 |
| Goleada (diff ≥ 3 em ambos) | +1 |

Em empates, como a diferença de gols é sempre 0 × 0, qualquer empate acertado que não seja placar exato recebe **+2** pela diferença de gols.

O máximo possível por partida é **7 pontos** (base + exato + goleada).

---

## Variáveis de ambiente

Crie `backend/.env` com:

```env
DATABASE_URL=postgresql://bolao_user:bolao_pass@localhost:5432/bolao_db

JWT_SECRET=sua_chave_secreta_longa

FOOTBALL_API_KEY=sua_chave_football_data_org
```

---

## Rodando com Docker

```bash
# Subir backend e banco
docker compose up -d --build

# Acompanhar logs
docker compose logs -f backend

# Rodar migrations (primeira vez)
docker compose exec backend pnpm exec prisma migrate dev --name init
```

A API sobe em `http://localhost:3000`. O banco fica acessível na porta `5432`.

```bash
# Derrubar (mantém dados)
docker compose down

# Reset completo (apaga o banco)
docker compose down -v
```

---

## Rodando sem Docker

**Backend:**
```bash
cd backend
pnpm install
pnpm exec prisma migrate dev
pnpm run start:dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## API — rotas principais

### Auth — `/auth`
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/auth/register` | Registra novo usuário |
| POST | `/auth/login` | Login, retorna JWT |
| GET | `/auth/me` | Perfil do usuário autenticado |
| PATCH | `/auth/me` | Atualiza nome de exibição |

### Partidas — `/matches`
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/matches` | Lista todas as partidas com palpite do usuário (se autenticado) |

### Palpites — `/predictions` (requer JWT)
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/predictions` | Cria palpite para uma partida |
| PUT | `/predictions/:id` | Atualiza palpite (antes do kickoff) |
| GET | `/predictions/me` | Palpites do usuário autenticado |
| GET | `/predictions/finished` | Todos os palpites de partidas encerradas |

### Ranking — `/ranking`
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/ranking` | Ranking geral por pontos |

### Admin — `/admin` (requer role ADMIN)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/admin/users` | Lista todos os usuários |
| PATCH | `/admin/users/:id/role` | Altera role do usuário |
| PATCH | `/admin/users/:id/active` | Ativa/desativa usuário |
| GET | `/admin/predictions` | Lista todos os palpites |
| POST | `/admin/sync-results` | Dispara sync manual com a API de futebol |

---

## Sync automático de resultados

O serviço `ResultsSyncService` consulta a API do football-data.org a cada **5 minutos** e atualiza partidas e placar. Ao finalizar uma partida, os pontos de todos os palpites são recalculados automaticamente via transação no banco.

Para recalcular pontos de todas as partidas finalizadas manualmente:

```bash
cd backend
npx ts-node -r tsconfig-paths/register scripts/recalcular-pontos.ts
```

---

## Banco de dados

Modelos principais:

- **User** — usuários com role `USER` ou `ADMIN`
- **Team** — times sincronizados da API externa
- **Round** — rodadas/fases da competição
- **Match** — partidas com placar e status
- **Prediction** — palpite de um usuário para uma partida, com pontuação calculada
- **OtpCode** — códigos OTP para verificação de e-mail e reset de senha
