FROM node:20-alpine AS builder

WORKDIR /app

COPY packages/frontend/package.json ./packages/frontend/
COPY packages/shared/package.json ./packages/shared/

WORKDIR /app/packages/frontend
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine AS runtime

COPY --from=builder /app/packages/frontend/dist /usr/share/nginx/html
COPY nginx.frontend.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
