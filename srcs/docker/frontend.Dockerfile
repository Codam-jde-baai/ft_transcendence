FROM node:23-alpine

WORKDIR /app

# install pnpm
RUN npm install -g pnpm

# Create directories for SSL certificates
RUN mkdir -p /etc/frontend/ssl && \
    chmod 700 /etc/frontend/ssl

	
# Copy package.json and install dependencies
COPY ./config.conf /etc/frontend/conf.d/default.conf
COPY . .

# Set permissions for the script
RUN chmod +x /certificate.sh

# Expose 5173 port for HTTPS
EXPOSE 5173

RUN pnpm install --force

RUN pnpm install tailwindcss @tailwindcss/vite
RUN pnpm install tailwindcss @tailwindcss/postcss

RUN pnpm install postcss typescript @types/node --save-dev
RUN pnpm install --save-dev @types/dompurify
