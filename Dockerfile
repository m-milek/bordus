# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve
# Using nginx:alpine for static serving with caching headers
FROM nginx:alpine

# Copy the custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the minified static build from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 1918
CMD ["nginx", "-g", "daemon off;"]
