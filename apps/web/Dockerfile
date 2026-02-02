FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
WORKDIR /app
COPY . .
ENV CI=true
RUN pnpm install --frozen-lockfile

RUN NODE_OPTIONS="--max-old-space-size=1536" pnpm --filter web build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
ENV CI=true

# Copiamos lo esencial y los archivos de configuración del monorepo
COPY --from=builder /app/package.json .
COPY --from=builder /app/pnpm-workspace.yaml .
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json

EXPOSE 3000
# Entramos a la carpeta de la web para iniciar
WORKDIR /app/apps/web
CMD ["node_modules/.bin/next", "start"]