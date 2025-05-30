#!/bin/bash

# Create SSL certificate (to use HTTPS)
echo "Creating a certificate..."
openssl req \
    -x509 \
    -nodes \
    -days 365 \
    -newkey rsa:2048 \
    -subj "/C=NL/ST=Holland/L=Amsterdam/O=Codam/CN=${DOMAIN_NAME}" \
    -out "/etc/frontend/ssl/selfsigned.crt" \
    -keyout "/etc/frontend/ssl/selfsigned.key"

# checking start command
echo "Start command: $@"
exec "$@"