# Dockerfile for Frontend

# ---- Stage 1: Build the React app ----
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the static files
RUN npm run build

# ---- Stage 2: Serve with Nginx ----
FROM nginx:stable-alpine

# Copy the static files from the builder stage to Nginx's web root
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy our custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# The command to start Nginx
CMD ["nginx", "-g", "daemon off;"]