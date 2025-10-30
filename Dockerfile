# Multi-stage build for Astro static site

# Stage 1: Build the Astro application
FROM node:18-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build arguments for environment variables (passed at build time)
ARG PUBLIC_OKTA_DOMAIN
ARG PUBLIC_OKTA_CLIENT_ID
ARG PUBLIC_OKTA_REDIRECT_URI

# Set environment variables for build
ENV PUBLIC_OKTA_DOMAIN=${PUBLIC_OKTA_DOMAIN}
ENV PUBLIC_OKTA_CLIENT_ID=${PUBLIC_OKTA_CLIENT_ID}
ENV PUBLIC_OKTA_REDIRECT_URI=${PUBLIC_OKTA_REDIRECT_URI}

# Build the application
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
