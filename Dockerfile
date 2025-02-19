# ------------------------------------------------------------------------------
# Build shadowbg binary & frontend
FROM alpine:latest AS shadowbgbuild
RUN apk update && apk add npm go git alpine-sdk

ADD https://api.github.com/repos/OSS-App-Forks/shadowbg/git/refs/heads/master version.json
RUN git clone https://github.com/OSS-App-Forks/shadowbg /shadowbg
RUN cd /shadowbg && CGO_CFLAGS="-D_LARGEFILE64_SOURCE=1" go build -o shadow.bg main.go && strip shadow.bg

ADD https://api.github.com/repos/xav1erenc/shadowbg-frontend/git/refs/heads/master version2.json
RUN git clone https://github.com/xav1erenc/shadowbg-frontend /frontend
RUN cd /frontend && npm install && npm run build && mv out /fe

# ------------------------------------------------------------------------------
# Pull base image
FROM alpine:latest
LABEL maintainer="xav1erenc"
LABEL org.opencontainers.image.source="https://github.com/OSS-App-Forks/shadowbg"
# ------------------------------------------------------------------------------
# Copy files to final stage
COPY --from=shadowbgbuild /shadowbg/shadow.bg /app/shadow.bg
COPY --from=shadowbgbuild /shadowbg/app.sh /app/
COPY --from=shadowbgbuild /fe /app/frontend/

# ------------------------------------------------------------------------------
# Identify Volumes
VOLUME /data

# ------------------------------------------------------------------------------
# Expose ports
EXPOSE 80

# ------------------------------------------------------------------------------
# Define default command
CMD ["/app/app.sh"]
