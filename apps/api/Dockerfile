FROM node:20-slim
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Instalamos OpenSSL (vital para Prisma) y herramientas de compilación
RUN apt-get update && apt-get install -y openssl python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .

# 1. Instalar dependencias
RUN pnpm install --frozen-lockfile

# 2. Generar Prisma ANTES del build (apuntando al schema)
RUN pnpm --filter api exec prisma generate --schema=./apps/api/prisma/schema.prisma

# 3. Compilar NestJS (ahora sí encontrará los tipos)
RUN pnpm --filter api build

EXPOSE 3000
CMD [ "pnpm", "--filter", "api", "start:prod" ]