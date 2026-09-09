FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/backend/package.json ./packages/backend/

RUN npm install -g pnpm && npm i -g pnpm

RUN corepack enable && corepack prepare pnpm@8 --activate

WORKDIR /app
COPY . .

RUN npx prisma generate --schema=packages/backend/prisma/schema.prisma

WORKDIR /app/packages/backend
RUN npm install
RUN npm run build

FROM node:20-alpine AS runtime

WORKDIR /app

COPY --from=builder /app/packages/backend/dist ./packages/backend/dist
COPY --from=builder /app/packages/backend/node_modules ./packages/backend/node_modules
COPY --from=builder /app/packages/backend/prisma ./packages/backend/prisma
COPY --from=builder /app/packages/shared/src ./packages/shared/src
COPY --from=builder /app/packages/shared/package.json ./packages/shared/package.json

WORKDIR /app/packages/backend

EXPOSE 4000

CMD ["node", "dist/index.js"]
