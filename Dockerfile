FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install --ignore-scripts
FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build
FROM node:22-alpine AS runtime
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=8080
WORKDIR /app
COPY --from=build /app ./
USER node
EXPOSE 8080
CMD ["npm","start","--","-p","8080"]
