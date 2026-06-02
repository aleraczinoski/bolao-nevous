FROM node:20-slim

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml prisma.config.ts ./
COPY prisma ./prisma
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm exec prisma generate
RUN pnpm run build

EXPOSE 3000
CMD ["node", "dist/main"]
