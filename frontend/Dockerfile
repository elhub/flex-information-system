# fronted - build for production
# https://hub.docker.com/r/nginxinc/nginx-unprivileged
FROM docker.jfrog.elhub.cloud/node:lts AS builder

WORKDIR /usr/src/app

COPY package*.json .npmrc ./
RUN npm install

COPY . .

RUN npm run build

FROM docker.jfrog.elhub.cloud/nginxinc/nginx-unprivileged:stable-alpine AS final
ARG UID=101

COPY --from=builder /usr/src/app/dist /usr/share/nginx/html
COPY --from=builder /usr/src/app/docker-entrypoint.d/50-window-env.sh /docker-entrypoint.d/

USER root
RUN touch /usr/share/nginx/html/env.js && chown nginx:nginx /usr/share/nginx/html/env.js
USER $UID
