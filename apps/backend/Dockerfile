FROM node:22-alpine

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

EXPOSE 3000

# Esperar a que la base de datos esté lista y luego correr migraciones y el servidor
# Nota: En un entorno real de producción, las migraciones suelen correrse en un paso separado del pipeline CD
CMD ["sh", "-c", "npx sequelize-cli db:migrate && node index.js"]
