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

COPY --from=build /usr/src/app/dist/ksp-deltav-planner /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
