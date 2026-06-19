FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY apps/api/package.json apps/api/package.json
COPY packages/domain/package.json packages/domain/package.json
RUN npm install

FROM deps AS build
COPY . .
RUN npm run build --workspace @hubsteriacarepro/domain && npm run build --workspace @hubsteriacarepro/api

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/packages/domain/dist ./packages/domain/dist
CMD ["node", "apps/api/dist/src/server.js"]
