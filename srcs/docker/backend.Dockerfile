# Use Node.js LTS version
FROM node:23-alpine

# Set working directory
# Set working directory
WORKDIR /app

RUN mkdir data

# Install necessary build dependencies
RUN apk add --no-cache sqlite sqlite-dev python3 make g++ gcc musl-dev

# Install pnpm
RUN npm install -g pnpm

# Copy all
COPY . .

# Install dependencies
RUN pnpm install --force

# Rebuild better-sqlite3 for alpine
RUN pnpm rebuild better-sqlite3

# RUN pnpm db:generate

# RUN pnpm db:migrate

# RUN pnpm db:push

# Expose backend port
EXPOSE 3000

# CMD is defined in dockerfile to differentiate between dev and non-dev env

#CMD ["tail", "-f", "/dev/null"]