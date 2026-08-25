# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve
# Using busybox uclibc for an ultra-minimal ~1MB image
FROM busybox:1.36.1-uclibc

# Run as a non-root user for security
RUN adduser -D -H static
USER static
WORKDIR /home/static

# Copy the minified static build from the builder stage
COPY --from=builder /app/dist ./

EXPOSE 1918
# Run the built-in busybox httpd server
CMD ["busybox", "httpd", "-f", "-v", "-p", "1918"]
