FROM node:23-alpine

WORKDIR /app

# install pnpm
RUN npm install -g pnpm

# Copy package.json and install dependencies
COPY . .

RUN pnpm install --force

RUN pnpm install tailwindcss @tailwindcss/vite
RUN pnpm install tailwindcss@latest

RUN pnpm install postcss typescript @types/node --save-dev
RUN pnpm install --save-dev @types/dompurify
