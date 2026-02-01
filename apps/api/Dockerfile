FROM node:20-slim
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Instalamos OpenSSL (El log confirmó que es obligatorio)
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .

ENV CI=true

# 1. Instalamos permitiendo scripts de construcción (Para pnpm v10)
RUN pnpm install --frozen-lockfile --unsafe-perm

# 2. Generamos Prisma usando la ruta RELATIVA CORRECTA
# Si estás en la raíz del monorepo dentro de /app:
RUN pnpm --filter api exec prisma generate --schema=./prisma/schema.prisma

# 3. Compilamos
RUN pnpm --filter api build

EXPOSE 3000
CMD [ "pnpm", "--filter", "api", "start:prod" ]