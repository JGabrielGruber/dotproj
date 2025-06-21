FROM oven/bun:latest

WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install

COPY . .

ENV NODE_ENV=production

EXPOSE 8080

CMD ["bun", "run", "src/server.ts"]
