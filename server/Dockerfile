FROM oven/bun

WORKDIR /app

COPY . .

RUN bun install

EXPOSE 4005

CMD ["bun","run","server.ts"]