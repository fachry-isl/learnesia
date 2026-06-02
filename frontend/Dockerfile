FROM node:22-alpine AS builder

WORKDIR /app

# NEXT_PUBLIC_* must be set at build time — runtime container env cannot change client bundles.
ARG NEXT_PUBLIC_API_URL=/api
ARG NEXT_PUBLIC_SITE_URL=https://learnesia.co.id
ARG NEXT_PUBLIC_ADMIN_PATH=/admin
ARG NEXT_PUBLIC_ADMIN_SECRET_KEY

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_ADMIN_PATH=$NEXT_PUBLIC_ADMIN_PATH
ENV NEXT_PUBLIC_ADMIN_SECRET_KEY=$NEXT_PUBLIC_ADMIN_SECRET_KEY

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
