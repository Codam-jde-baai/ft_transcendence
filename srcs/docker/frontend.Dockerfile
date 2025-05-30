FROM node:23-alpine

WORKDIR /app

# install pnpm
RUN npm install -g pnpm

COPY . .

# Install dependencies
RUN pnpm install --force

RUN pnpm install tailwindcss @tailwindcss/vite
RUN pnpm install tailwindcss @tailwindcss/postcss

RUN pnpm install postcss typescript @types/node --save-dev
RUN pnpm install --save-dev @types/dompurify
