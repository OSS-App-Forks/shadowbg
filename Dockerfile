# ------------------------------------------------------------------------------
# Build shadowbg binary
FROM golang:alpine AS backend-build
RUN apk add --no-cache alpine-sdk

WORKDIR /build
COPY backend/ ./
RUN go mod download && CGO_CFLAGS="-D_LARGEFILE64_SOURCE=1" go build -o shadow.bg main.go && strip shadow.bg

# ------------------------------------------------------------------------------
# Build frontend
FROM node:alpine AS frontend-build
WORKDIR /build
COPY ui/ ./
RUN npm install && npm run build

# ------------------------------------------------------------------------------
# Pull base image
FROM alpine:latest
LABEL maintainer="droidfreak32"
LABEL org.opencontainers.image.source="https://github.com/OSS-App-Forks/shadowbg"

WORKDIR /app

# ------------------------------------------------------------------------------
# Copy files to final stage
COPY --from=backend-build /build/shadow.bg /app/shadow.bg
COPY start.sh /app/
# The frontend build is assumed to output to 'out' (common for Next.js/SSG)
COPY --from=frontend-build /build/out /app/frontend/

# ------------------------------------------------------------------------------
# Expose ports
EXPOSE 80

# ------------------------------------------------------------------------------
# Define default command
CMD ["./start.sh"]
