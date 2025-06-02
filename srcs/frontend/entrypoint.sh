#!/bin/sh

echo "Starting entrypoint..."

# # # -> RUN this firt on your host machine to install mkcert <-
# curl -JLO "https://github.com/FiloSottile/mkcert/releases/latest/download/mkcert-v$(curl -s https://api.github.com/repos/FiloSottile/mkcert/releases/latest | grep -Po '"tag_name": "\K[^"]+')-darwin-amd64"
# chmod +x mkcert-v*-darwin-amd64
# mkdir -p ~/.local/bin
# mv mkcert-v*-darwin-amd64 ~/.local/bin/mkcert
# chmod +x ~/.local/bin/mkcert
# export PATH=$HOME/.local/bin:$PATH
# mkcert -install
# mkcert -cert-file certs/localhost.pem -key-file certs/localhost-key.pem localhost

CERT_PATH=/certs
mkdir -p $CERT_PATH

# Create certs if they don't exist
if [ ! -f "$CERT_PATH/localhost.pem" ] || [ ! -s "$CERT_PATH/localhost.pem" ]; then
  openssl req -x509 -newkey rsa:2048 -nodes \
    -keyout "$CERT_PATH/localhost-key.pem" \
    -out "$CERT_PATH/localhost.pem" \
    -days 365 \
    -subj "/CN=localhost"
fi

# Set env vars so Vite uses HTTPS
export SSL_CRT_FILE=/app/certs/localhost.pem
export SSL_KEY_FILE=/app/certs/localhost-key.pem
export HTTPS=true

# start app
pnpm dev