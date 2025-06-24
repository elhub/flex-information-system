# fronted - build for production
# https://hub.docker.com/r/nginxinc/nginx-unprivileged
FROM docker.jfrog.elhub.cloud/node:lts AS builder

WORKDIR /usr/src/app

COPY package*.json .npmrc ./
RUN npm install

COPY . .

RUN npm run build

FROM docker.jfrog.elhub.cloud/nginxinc/nginx-unprivileged:stable-alpine AS final
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html
