# Build
FROM node:lts-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build:prod

# Prod
FROM nginx:stable AS prod

COPY --from=build /usr/src/app/dist/ksp-deltav-planner /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
