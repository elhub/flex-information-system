# frontend - build for production

# We first create a base image for serving static files with nginx.
# It is intended to be used in scenarios where we want:
#
#  * run unprivileged - as nobody
#  * run with read only root filesystem
FROM docker.jfrog.elhub.cloud/nginxinc/nginx-unprivileged:stable-alpine-slim AS nginx-unpriv

# We want to run as the nobody user
ARG UID=65534
ARG GID=65534

# We want gzip compression for better performance
COPY nginx.conf.d/05-gzip.conf /etc/nginx/conf.d/05-gzip.conf

# Since we are not running as nginx anymore, we need to ensure that the nobody user has access to
# the necessary directories used by nginx.
# This is from https://github.com/nginx/docker-nginx-unprivileged/blob/main/stable/alpine-slim/Dockerfile#L101-L110
USER root
RUN chown -R nobody:0 /var/cache/nginx \
&& chmod -R g+w /var/cache/nginx \
&& chown -R nobody:0 /etc/nginx \
&& chmod -R g+w /etc/nginx \
# We also want default liveness and readiness probe files
&& touch /usr/share/nginx/html/health \
&& touch /usr/share/nginx/html/healthz \
&& touch /usr/share/nginx/html/readyz \
&& touch /usr/share/nginx/html/livez \
&& chown -R nobody:nobody /usr/share/nginx/html

USER nobody

# https://hub.docker.com/r/nginxinc/nginx-unprivileged
FROM docker.jfrog.elhub.cloud/node:lts AS builder

WORKDIR /usr/src/app

COPY package*.json .npmrc ./
RUN npm install

COPY . .

RUN npm run build

FROM nginx-unpriv AS final
COPY --from=builder --chown=nobody:nobody /usr/src/app/dist /usr/share/nginx/html
