FROM node:20-alpine AS builder

WORKDIR /app

COPY packages/ai-service/package.json ./packages/ai-service/
COPY packages/shared/package.json ./packages/shared/

RUN npm install -g pnpm && corepack enable && corepack prepare pnpm@8 --activate

COPY . .

WORKDIR /app/packages/ai-service
RUN npm install
RUN npm run build

FROM node:20-alpine AS runtime

WORKDIR /app

COPY --from=builder /app/packages/ai-service/dist ./packages/ai-service/dist
COPY --from=builder /app/packages/ai-service/node_modules ./packages/ai-service/node_modules
COPY --from=builder /app/packages/shared/src ./packages/shared/src
COPY --from=builder /app/packages/shared/package.json ./packages/shared/package.json

WORKDIR /app/packages/ai-service

EXPOSE 4001

CMD ["node", "dist/index.js"]
