FROM node:22.23.5-alpine@sha256:1314fb30ec37592d5845e5a160d522c0e680972aa534549940b8d73bde88481a AS build
WORKDIR /usr/src/app
COPY package*.json ./
COPY vendor ./vendor
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build && npm prune --omit=dev --ignore-scripts

FROM node:22.23.5-alpine@sha256:1314fb30ec37592d5845e5a160d522c0e680972aa534549940b8d73bde88481a AS runtime
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY --from=build --chown=node:node /usr/src/app/node_modules ./node_modules
COPY --from=build --chown=node:node /usr/src/app/dist ./dist
USER node
EXPOSE 3011
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3011)+'/health',{signal:AbortSignal.timeout(3000)}).then(async r=>{if(!r.ok||(await r.json()).status!=='ok')process.exit(1)}).catch(()=>process.exit(1))"

CMD ["node", "dist/main.js"]
