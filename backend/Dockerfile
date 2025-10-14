# Dockerfile for Backend (Corrected)

# ---- Stage 1: Build the application ----
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# The Fix: Copy Prisma schema BEFORE running npm install
COPY prisma ./prisma/

# Now, run install. The postinstall script will find the schema.
RUN npm install

# Copy the rest of the application code
COPY . .

# ---- Stage 2: Production image ----
FROM node:18-alpine

WORKDIR /usr/src/app

# Copy built assets from the builder stage
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/prisma ./prisma
COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma
COPY . .

EXPOSE 3000

CMD ["npm", "start"]