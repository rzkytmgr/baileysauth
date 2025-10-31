FROM node:20

WORKDIR /app

COPY src/ src/
COPY test/ test/
COPY .husky/ .husky/
COPY .github/ .github/
COPY *.yaml *.mjs *.json .env .

RUN echo 'container building'
RUN npm i -g pnpm
RUN pnpm i
RUN pnpm format
RUN pnpm lint
RUN pnpm build

CMD ["pnpm", "test"]
