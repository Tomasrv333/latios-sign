FROM node:20-slim
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .
ENV CI=true

# 1. Instalación
RUN pnpm install --frozen-lockfile --unsafe-perm

# 2. Generar Prisma (RUTA CORREGIDA)
RUN pnpm --filter api exec prisma generate --schema=./prisma/schema.prisma

# 3. Compilar
RUN pnpm --filter api build

# 4. Ejecución (Nos paramos donde está el dist)
WORKDIR /app
EXPOSE 3000
CMD ["node", "apps/api/dist/main"]