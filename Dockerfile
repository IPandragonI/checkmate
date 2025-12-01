FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install
COPY . .

RUN npx prisma generate

RUN npm run build

RUN npm prune --production

FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache netcat-openbsd

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src ./src


COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENV PORT=3000
EXPOSE 3000

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["npm","start"]