FROM node:18-alpine AS build
WORKDIR /usr/src/app

# Install deps and build
COPY package.json package-lock.json* ./
RUN npm install --include=dev || npm install
COPY . .
RUN npm install typescript@latest --no-audit --no-fund || true
RUN npx tsc -p tsconfig.json

FROM node:18-alpine AS runtime
WORKDIR /usr/src/app
COPY --from=build /usr/src/app/package.json ./
COPY --from=build /usr/src/app/dist ./dist
RUN npm install --omit=dev --no-audit --no-fund || true
EXPOSE 4000
CMD ["node", "dist/index.js"]
