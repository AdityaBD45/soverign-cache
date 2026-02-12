# 1) Install deps (root)
FROM node:22-alpine AS deps
WORKDIR /repo

COPY package.json package-lock.json ./
COPY apps ./apps
COPY packages ./packages

RUN npm install

# 2) Build only web
FROM node:22-alpine AS builder
WORKDIR /repo

COPY --from=deps /repo /repo

RUN npm run build -w apps/web

# 3) Run web
FROM node:22-alpine AS runner
WORKDIR /repo

ENV NODE_ENV=production

COPY --from=builder /repo /repo

EXPOSE 3000

CMD ["npm", "run", "start", "-w", "apps/web"]
