FROM node:20-slim
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Instalamos OpenSSL, necesario para que Prisma funcione en debian/slim
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY . /app
WORKDIR /app

RUN pnpm install --frozen-lockfile

# --- PASO CRUCIAL PARA MONOREPOS ---
# Generamos el cliente de Prisma antes de compilar NestJS
RUN pnpm --filter api exec prisma generate

# Ahora sí, compilamos la API
RUN pnpm --filter api build

EXPOSE 3000
CMD [ "pnpm", "--filter", "api", "start:prod" ]