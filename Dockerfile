# Multi-stage build for Vite + React SPA
# syntax=docker/dockerfile:1

# --- Dependencies ---
FROM node:20-bookworm-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# --- Build ---
FROM node:20-bookworm-slim AS build
WORKDIR /app
ENV NODE_ENV=production

ARG VITE_API_URL
ARG VITE_APP_NAME
ARG VITE_ENV
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_APP_NAME=$VITE_APP_NAME
ENV VITE_ENV=$VITE_ENV

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# --- Runtime (nginx serves static build) ---
FROM nginx:alpine AS runner

# Remove default nginx config
RUN rm -f /etc/nginx/conf.d/default.conf

# Copy Vite build output to nginx html directory
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom nginx config for SPA routing
COPY nginx/prod/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 3069

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3069/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
