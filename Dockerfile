ARG NODE_VERSION=24
FROM node:${NODE_VERSION}

WORKDIR /app

COPY src/ src/
COPY test/ test/
COPY *.yaml *.mjs *.json .env.test .

RUN echo 'container building'
RUN npm i -g pnpm@10.14.0
RUN pnpm i
RUN pnpm format
RUN pnpm lint
RUN pnpm build:swc && pnpm build:tsc

CMD ["pnpm", "test"]
