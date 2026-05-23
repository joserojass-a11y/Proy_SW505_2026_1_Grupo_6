# Etapa 1: Compilación de React/Vite
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

# Etapa 2: Nginx como Reverse Proxy / Servidor de Estáticos
FROM nginx:1.25-alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Configuración base para SPA (redirigir 404 a index.html)
RUN echo 'server { listen 80; location / { root /usr/share/nginx/html; index index.html; try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]