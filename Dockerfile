FROM ghcr.io/pnpm/pnpm:12 AS build

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

FROM caddy AS prod

WORKDIR /app

COPY Caddyfile ./
COPY --from=build /app/dist/ksp-deltav-planner ./dist

CMD ["caddy", "run", "--config", "Caddyfile"]
