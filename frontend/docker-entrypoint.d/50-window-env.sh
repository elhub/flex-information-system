#!/bin/sh
set -e

entrypoint_log() {
	if [ -z "${NGINX_ENTRYPOINT_QUIET_LOGS:-}" ]; then
		echo "$@"
	fi
}
ME=$(basename "$0")

# NOTE: The env variables can _NOT_ contain the equal sign '='
# It is based on
#  * https://stackoverflow.com/a/74701083
#  * https://www.jeffgeerling.com/blog/2018/deploying-react-single-page-web-app-kubernetes
#
# The script must be put in the /docker-entrypoint.d/ directory
# Ref: https://github.com/nginx/docker-nginx-unprivileged/tree/main/entrypoint
#
CONFIG_FILE="/usr/share/nginx/html/env.js"

{
	echo "/*<![CDATA[*/"
	echo "window.env = window.env || {};"
	env | grep VITE_FLEX | awk -F"=" '{print "window.env." $1 "=\047" $2 "\047;"}'
	echo "/*]]>*/"
} >$CONFIG_FILE

entrypoint_log "$ME: info: created $CONFIG_FILE"
