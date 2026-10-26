# Builds the web app for DigitalOcean App Platform's static site (slice 3.8). App Platform runs this
# from the repository root and serves `/src/apps/web/dist` from the final image; nothing runs at
# request time. Node matches `.node-version`; pnpm comes from `packageManager` through corepack.
FROM node:24.22.1-bookworm-slim@sha256:55fb5f5a527ea2c5c4a95f963e48ef90aa38c7b346054fdc8ee9957a2b55d205
WORKDIR /src
RUN corepack enable
COPY . .
RUN pnpm install --frozen-lockfile \
 && pnpm --filter @htco/web build
