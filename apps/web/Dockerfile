# Builds the web app for DigitalOcean App Platform's static site (slice 3.8). App Platform runs this
# from the repository root and serves `/src/apps/web/dist` from the final image; nothing runs at
# request time. Node matches `.node-version`; pnpm comes from `packageManager` through corepack.
FROM node:24.19.0-bookworm-slim
WORKDIR /src
RUN corepack enable
COPY . .
RUN pnpm install --frozen-lockfile \
 && pnpm --filter @htco/web build
