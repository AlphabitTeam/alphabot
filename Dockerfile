#
# Dockerfile with multiple stages to have better
# building performance thanks to the cache layers.
#

########## Stage 1

FROM node:16-alpine AS builder

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY package.json ./

RUN npm config set unsafe-perm true

RUN npm install -g -f yarn
RUN npm install -g typescript
RUN npm install -g ts-node

USER node

RUN yarn install

COPY --chown=node:node . .

RUN yarn build

########## Stage 2

FROM node:16-alpine

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY package*.json ./

USER node

RUN yarn install

COPY --from=builder /home/node/app/dist ./dist
COPY --chown=node:node .env .

EXPOSE 8080

CMD ["yarn", "bot"]
