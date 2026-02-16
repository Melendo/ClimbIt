FROM node:22-alpine

WORKDIR /app

COPY package.json ./

RUN npm install --omit=dev

# Instalar cliente de postgres para usar pg_isready
RUN apk add --no-cache postgresql-client

COPY . .

EXPOSE 3000

# Esperar a que la base de datos esté lista y luego correr migraciones y el servidor
# Nota: En un entorno real de producción, las migraciones suelen correrse en un paso separado del pipeline CD
CMD ["sh", "-c", "until pg_isready -h db -p 5432; do echo 'Waiting for DB...'; sleep 2; done; npx sequelize-cli db:migrate && node index.js"]
