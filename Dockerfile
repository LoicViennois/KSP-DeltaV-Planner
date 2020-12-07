# Build
FROM node:lts-alpine as build

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run lint && \
    npm run build:prod

# Prod
FROM nginx:stable as prod

RUN apt-get update && apt-get install --no-install-recommends -y curl

COPY --from=build /usr/src/app/dist/ksp-deltav-planner /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

HEALTHCHECK CMD curl -f http://localhost/ || exit 1
