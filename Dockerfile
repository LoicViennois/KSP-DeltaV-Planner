# Build
FROM node:lts-slim AS build

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build:prod

# Prod
FROM caddy:2-alpine AS prod

COPY --from=build /usr/src/app/dist/ksp-deltav-planner /usr/share/caddy
COPY Caddyfile /etc/caddy/Caddyfile
