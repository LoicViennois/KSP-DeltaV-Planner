FROM node:lts-alpine AS build

ENV NPM_CONFIG_UPDATE_NOTIFIER=false
ENV NPM_CONFIG_FUND=false

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build:prod

FROM caddy AS prod

WORKDIR /app

COPY Caddyfile ./
COPY --from=build /app/dist/ksp-deltav-planner ./dist

CMD ["caddy", "run", "--config", "Caddyfile"]
