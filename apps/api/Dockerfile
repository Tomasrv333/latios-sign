FROM node:20-slim
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Instalamos dependencias del sistema para Prisma
RUN apt-get update && apt-get install -y openssl python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY . /app
WORKDIR /app

# Instalamos TODAS las dependencias del monorepo
RUN pnpm install --frozen-lockfile

# GENERACIÓN DE PRISMA (El orden importa)
# Forzamos la generación del cliente específicamente para la API
RUN pnpm --filter api exec prisma generate

# COMPILACIÓN
RUN pnpm --filter api build

EXPOSE 3000
CMD [ "pnpm", "--filter", "api", "start:prod" ]