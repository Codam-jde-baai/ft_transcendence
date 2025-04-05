# Use Node.js LTS version - changing from 23 to 20 (current LTS)
FROM node:20-alpine

# Set working directory
WORKDIR /app

RUN mkdir data

# Install necessary build dependencies
RUN apk add --no-cache sqlite sqlite-dev python3 make g++ gcc musl-dev \
	libtool autoconf automake git libstdc++ libsodium libsodium-dev

# Install pnpm
RUN npm install -g pnpm

# Copy all
COPY . .

RUN pnpm add sodium-native@latest --force

# Explicitly clean and rebuild the native modules
RUN rm -rf node_modules/.pnpm/sodium-native*
RUN rm -rf node_modules/.pnpm/better-sqlite3*
RUN pnpm rebuild better-sqlite3
RUN pnpm rebuild sodium-native

# Verify sodium-native installation
RUN node -e "require('sodium-native')" || (echo "Sodium-native still not working" && exit 1)


# Database setup
RUN pnpm db:generate
RUN pnpm db:migrate
RUN pnpm db:push

# Expose backend port
EXPOSE 3000

# CMD is defined in dockerfile to differentiate between dev and non-dev env
#CMD ["tail", "-f", "/dev/null"]