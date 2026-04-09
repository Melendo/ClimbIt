FROM node:22-alpine

WORKDIR /app

COPY package.json ./

RUN npm install --omit=dev

# Instalar cliente de postgres para usar pg_isready
RUN apk add --no-cache postgresql-client

COPY . .

EXPOSE 3000

# Crear la estructura de uploads en el volumen persistente, esperar DB y arrancar
# Nota: En un entorno real de producción, las migraciones suelen correrse en un paso separado del pipeline CD
CMD ["sh", "-c", "mkdir -p /app/uploads/fotos_perfil /app/uploads/imagenes_pistas /app/uploads/logos_rocodromos /app/uploads/mapas_zonas /app/uploads/tmp/imagenes_pistas && until pg_isready -h db -p 5432; do echo 'Waiting for DB...'; sleep 2; done; npx sequelize-cli db:migrate && node index.js"]
