# Bolão da Copa - Nevous 🏆

Aplicação full-stack para gerenciamento de um bolão da Copa do Mundo entre amigos.

## 🚀 Tecnologias e Stack Utilizada

### Frontend
- **React 19 & Vite 8** (Interface SPA ágil)
- **Tailwind CSS v4** (Estilização nativa e moderna)
- **React Router 7** (Navegação e proteção de rotas)
- **@react-oauth/google** (Autenticação social)
- **Axios** (Comunicação com a API)

### Backend
- **NestJS 11** (Framework modular em TypeScript)
- **Prisma ORM** (Modelagem e consultas ao banco)
- **PostgreSQL** (Banco de dados relacional)
- **Passport.js & JWT** (Controle de sessão e OAuth2)
- **Class-Validator** (Validação estrita de dados)

---

## 🛠️ Como Rodar o Projeto

Certifique-se de ter o **Node.js** instalado em sua máquina.

### 1. Configurando o Backend

Abra o terminal na pasta raiz do projeto e execute os seguintes comandos:

```bash
# Entre na pasta do backend
cd backend

# Instale as dependências usando o pnpm
npx pnpm install

# Aprove a execução dos scripts necessários (se solicitado pelo pnpm)
npx pnpm approve-builds
```

Antes de iniciar o servidor, abra o arquivo `backend/.env` e configure a URL de conexão com o seu banco de dados PostgreSQL real (Neon.tech, Supabase ou local):
```env
DATABASE_URL="postgresql://usuario:senha@host:porta/banco"
```

Com o `.env` configurado, sincronize as tabelas com o banco de dados e inicialize o servidor:
```bash
# Cria as tabelas no PostgreSQL via Prisma
npx pnpm prisma db push

# Inicializa o servidor do backend em modo de desenvolvimento
npm run start:dev
```
O backend estará rodando por padrão em `http://localhost:3000` (ou na porta configurada pelo NestJS).

### 2. Configurando o Frontend

Abra um novo terminal na pasta raiz do projeto:

```bash
# Entre na pasta do frontend
cd frontend

# Instale as dependências
npm install

# Inicializa o servidor do frontend em modo de desenvolvimento
npm run dev
```
O Vite abrirá a aplicação, geralmente no endereço `http://localhost:5173`.