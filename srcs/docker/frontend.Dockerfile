FROM node:23-alpine

WORKDIR /app

# Install necessary tools
RUN apk add --no-cache openssl

# install pnpm
RUN npm install -g pnpm

COPY . .

# Install dependencies
RUN pnpm install --force
RUN pnpm install tailwindcss @tailwindcss/vite
RUN pnpm install tailwindcss @tailwindcss/postcss
RUN pnpm install postcss typescript @types/node --save-dev
RUN pnpm install --save-dev @types/dompurify

# Copy and set permissions for entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Entrypoint script runs cert gen + app start
ENTRYPOINT ["/entrypoint.sh"]