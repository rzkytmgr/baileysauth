ARG NODE_VERSION=20
FROM node:${NODE_VERSION}

WORKDIR /app

COPY src/ src/
COPY test/ test/
COPY *.yaml *.mjs *.json .env.test .

RUN echo 'container building'
RUN npm i -g pnpm
RUN pnpm i
RUN pnpm format
RUN pnpm lint
RUN pnpm build

CMD ["pnpm", "test"]
