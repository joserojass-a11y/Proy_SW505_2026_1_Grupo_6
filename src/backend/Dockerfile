# Etapa 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY . .
# Simulación del build step si usas TypeScript o un bundler
# RUN npm run build 

# Etapa 2: Producción
FROM node:20-alpine AS production
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
WORKDIR /app

# Copiar artefactos y dependencias de producción
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./
# Cuando tengas la compilación de TS lista, descomenta la siguiente línea:
# COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist 

# Para Fase 0 copiamos el código crudo (Temporal hasta usar TypeScript)
COPY --from=builder --chown=nodejs:nodejs /app/src ./src
COPY --from=builder --chown=nodejs:nodejs /app/server.js ./

USER nodejs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Cambiar a dist/main.js en el futuro
CMD ["node", "server.js"]