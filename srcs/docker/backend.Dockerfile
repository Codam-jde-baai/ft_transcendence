# Use Node.js LTS version
FROM node:23-bookworm-slim

# Set working directory
WORKDIR /app

RUN mkdir data

# Install necessary build dependencies
RUN apt-get update && apt-get install -y \
	sqlite3 libsqlite3-dev python3 make g++ gcc \
	libtool autoconf automake git libstdc++6 libsodium-dev \
	&& apt-get clean \
	&& rm -rf /var/lib/apt/lists/*

# Copy all
COPY . .

# Install pnpm
RUN npm install -g pnpm

RUN pnpm install --force

RUN pnpm rebuild better-sqlite3
RUN pnpm rebuild sodium-native

# RUN ls 

# RUN cat docker-entrypoint/generateDb.sh

# RUN chmod +x docker-entrypoint/generateDb.sh
# Database setup
# RUN pnpm db:generate

# RUN pnpm db:migrate

# RUN pnpm db:push

# Expose backend port
EXPOSE 3000

# CMD is defined in dockerfile to differentiate between dev and non-dev env
#CMD ["tail", "-f", "/dev/null"]