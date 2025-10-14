# Dockerfile for Backend

# ---- Stage 1: Build the application ----
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy Prisma schema
COPY prisma ./prisma/

# Generate Prisma Client
RUN npx prisma generate

# Copy the rest of the application code
COPY . .

# ---- Stage 2: Production image ----
FROM node:18-alpine

WORKDIR /usr/src/app

# Copy dependencies and generated Prisma client from the builder stage
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/prisma ./prisma
COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma

# Copy application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# The command to run the application
CMD ["npm", "start"]