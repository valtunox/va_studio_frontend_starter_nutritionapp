#!/bin/sh
set -e

# Create server config dir
mkdir -p /etc/nginx/servers.d

# Generate HTTP server block (always)
envsubst '${app_name} ${app_port}' < /etc/nginx/servers.d/server-80.conf.template > /etc/nginx/servers.d/80.conf

# Generate HTTPS server block only when SSL certs are mounted
if [ -f /etc/nginx/ssl/fullchain.pem ] && [ -f /etc/nginx/ssl/privkey.pem ]; then
    envsubst '${app_name} ${app_port}' < /etc/nginx/servers.d/server-443.conf.template > /etc/nginx/servers.d/443.conf
    echo "SSL certificates found - HTTPS enabled."
else
    echo "No SSL certificates at /etc/nginx/ssl/ - serving HTTP only."
fi

# Test and start
nginx -t
exec nginx -g 'daemon off;'
