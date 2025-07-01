#!/bin/sh

echo "Starting entrypoint..."
set -e

CERT_PATH=/app/certs

mkdir -p $CERT_PATH
chmod 777 $CERT_PATH

# Create certs if they don't exist
if [ ! -f "$CERT_PATH/localhost.pem" ] || [ ! -s "$CERT_PATH/localhost.pem" ]; then
  openssl req -x509 -newkey rsa:2048 -nodes \
    -keyout "$CERT_PATH/localhost-key.pem" \
    -out "$CERT_PATH/localhost.pem" \
    -days 365 \
    -subj "/CN=localhost"
    
    echo "Certificate generated."
fi

# Set env vars so Vite uses HTTPS
export SSL_CRT_FILE=/app/certs/localhost.pem
export SSL_KEY_FILE=/app/certs/localhost-key.pem
export HTTPS=true

# start app
pnpm dev