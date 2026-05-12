FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
# Install all deps (prisma CLI is a devDependency needed for generate + migrate)
RUN npm ci && npm cache clean --force

COPY . .

# Generate Prisma client at build time
RUN npx prisma generate

RUN addgroup -S appgroup && adduser -S appuser -G appgroup && \
    chown -R appuser:appgroup /app

USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Push schema to DB then start the server
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node src/server.js"]
