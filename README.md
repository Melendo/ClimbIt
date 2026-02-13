# ClimbIt

## 1. Descripción del proyecto

ClimbIt es una aplicación web/móvil que permite a un usuario registrarse para crear su perfil de “escalador” con el cual podrá asignarse a un rocódromo existente. Estos rocódromos añadidos tendrán un registro actualizado de las pistas que hay activas. Estas pistas pueden tener una dificultad asignada de base y además si un escalador marca como completada una pista puede dar su opinión sobre el nivel de dificultad de esta. Completando pistas subirás el nivel de tu perfil y se actualizará estadísticas sobre tu progreso en la escalada permitiéndote compararlo con tu grupo de amigos.

## 2. Guía de instalación

Esta guía te muestra cómo poner en marcha el proyecto en tu máquina local.

### 2.1. Requisitos previos

Asegúrate de tener instalado lo siguiente:

- [Node.js](https://nodejs.org/) (versión recomendada: 25.1.0 o superior)
- [npm](https://www.npmjs.com/) (viene con Node.js)
- [Docker](https://www.docker.com/) y [Docker Compose](https://docs.docker.com/compose/)
- [Git](https://git-scm.com/) (para clonar el repositorio)

> **Nota:** Este proyecto usa Docker para la base de datos PostgreSQL, por lo que **no necesitas** instalar PostgreSQL manualmente.

### 2.2. Instalación y configuración

Sigue estos pasos en orden:

#### Paso 1: Clonar el repositorio

```bash
git clone https://github.com/Melendo/ClimbIt.git
cd ClimbIt
```

#### Paso 2: Instalar dependencias

Este proyecto usa **Lerna** para gestionar el monorepo. Ejecuta:

```bash
npm install
```

Esto instalará las dependencias tanto del proyecto raíz como de todos los workspaces (backend y frontend).

#### Paso 3: Configurar variables de entorno

Crea un archivo `.env` en `apps/backend/` basándote en el archivo de ejemplo `.env.example`:

```bash
cd apps/backend
cp .env.example .env
```

Edita el archivo `.env` con tus propias configuraciones.

#### Paso 4: Levantar la base de datos con Docker

Desde la carpeta `apps/backend/`, ejecuta:

```bash
docker-compose up -d
```

Esto levantará:

- **PostgreSQL** en el puerto `5432`
- **pgAdmin** en el puerto `5050` (accesible en `http://localhost:5050`)

Verifica que los contenedores estén corriendo:

```bash
docker ps
```

#### Paso 5: Ejecutar las migraciones de base de datos

Desde la carpeta `apps/backend/`, ejecuta:

```bash
npm run db:migrate
```

Esto creará las tablas necesarias en la base de datos.

> **Nota:** Para visualizar las tablas creadas, puedes usar pgAdmin siguiendo la Guía de conexión de PostgreSQL con pgAdmin en el punto 3.


### 2.3. Ejecutar el proyecto

Vuelve a la carpeta raíz del proyecto:

```bash
cd ../..
```

#### Modo desarrollo (recomendado)

Ejecuta ambos servicios (backend y frontend) en modo desarrollo con hot reload:

```bash
npm run dev
```

Esto iniciará:

- **Backend** en `http://localhost:3000` (puerto definido en .env y con auto-reload)
- **Frontend** en `http://localhost:5173` (puerto variable y con auto-reload)

#### Acceder a la aplicación

- **Frontend:** [http://localhost:8080](http://localhost:5173)
- **Backend API:** [http://localhost:3000](http://localhost:3000)
- **pgAdmin:** [http://localhost:5050](http://localhost:5050)

### 2.4. Testing

Desde la carpeta raíz:

- **Ejecutar todos los tests:**

  ```bash
  npm run test
  ```

- **Ejecutar tests con cobertura de código:**
  ```bash
  npm run test:coverage
  ```

Los reportes de cobertura se generan en `apps/backend/coverage/`.

### 2.5. Otros comandos útiles

- **Linting:**

  ```bash
  npm run lint
  npm run lint:fix
  ```

- **Formateo de código:**

  ```bash
  npm run format
  ```

- **Limpiar dependencias:**

  ```bash
  npm run clean
  ```

- **Gestión de migraciones:**

  ```bash
  cd apps/backend

  # Revertir la última migración
  npm run db:migrate:undo

  # Crear una nueva migración
  npm run db:migrate:new -- nombre-de-la-migracion
  ```

- **Gestión de seeds (datos de prueba):**

  ```bash
  cd apps/backend

  # Ejecutar todos los seeders (poblar BD con datos de ejemplo)
  npm run db:seed

  # Revertir todos los seeders
  npm run db:seed:undo

  # Crear un nuevo seeder
  npm run db:seed:new -- nombre-del-seeder
  ```

- **Detener Docker:**
  ```bash
  cd apps/backend
  docker-compose down
  ```

### 2.6. Solución de problemas comunes

#### El puerto 3000 ya está en uso

Cambia los puertos en:

- Backend: modifica `PORT` en `apps/backend/.env`

#### Error al conectar con la base de datos

1. Verifica que Docker esté corriendo: `docker ps`
2. Verifica las credenciales en `apps/backend/.env`
3. Asegúrate de que el puerto 5432 no esté ocupado

#### Las migraciones fallan

1. Verifica que la base de datos esté levantada
2. Asegúrate de estar en la carpeta `apps/backend/` al ejecutar las migraciones
3. Verifica el `DATABASE_URL` en el archivo `.env`

## 3. Guía de conexión de PostgreSQL con pgAdmin

pgAdmin es una herramienta de administración gráfica para PostgreSQL que se levanta automáticamente con Docker Compose.

### 3.1. Acceder a pgAdmin

1. Asegúrate de que los contenedores de Docker estén corriendo:

   ```bash
   docker ps
   ```

2. Abre tu navegador y accede a: **http://localhost:5050**

3. Inicia sesión con las credenciales definidas en tu archivo `.env`:
   - **Email:** El valor de `PGADMIN_EMAIL`
   - **Password:** El valor de `PGADMIN_PASSWORD`

### 3.2. Conectar pgAdmin a PostgreSQL

Una vez dentro de pgAdmin, sigue estos pasos para conectarte a la base de datos:

#### Paso 1: Crear un nuevo servidor

1. En el panel izquierdo, haz clic derecho en **"Servers"**
2. Selecciona **"Register" > "Server..."**

#### Paso 2: Configurar la pestaña "General"

- **Name:** Escribe un nombre descriptivo (ejemplo: `ClimbIt DB`)

#### Paso 3: Configurar la pestaña "Connection"

Completa los siguientes campos con los valores de tu archivo `.env`:

- **Host name/address:** `db`
  > **Importante:** Usa `db` (nombre del servicio en docker-compose), NO `localhost`
- **Port:** `5432`

- **Maintenance database:** `postgres`

- **Username:** El valor de `POSTGRES_USER` de tu `.env`

- **Password:** El valor de `POSTGRES_PASSWORD` de tu `.env`

- (opcional) Marca la opción **"Save password"** (para no tener que ingresarla cada vez)

#### Paso 4: Guardar la conexión

Haz clic en **"Save"** para establecer la conexión.

### 3.3. Verificar la conexión

Si todo está correcto, deberías ver:

1. Tu servidor listado en el panel izquierdo
2. Al expandirlo: **Databases > [nombre de tu BD]**
3. Dentro encontrarás: **Schemas > public > Tables** (con las tablas creadas por las migraciones)

### 3.4. Solución de problemas con pgAdmin

#### No puedo conectarme usando "localhost" como host

Usa `db` en lugar de `localhost`. Cuando pgAdmin corre dentro de Docker, debe usar el nombre del servicio definido en `docker-compose.yml`.

#### Error: "could not connect to server"

1. Verifica que ambos contenedores estén corriendo: `docker ps`
2. Asegúrate de que las credenciales en `.env` coincidan con las que usas en pgAdmin
3. Verifica que el puerto 5432 no esté siendo usado por otra instancia de PostgreSQL

#### Olvidé las credenciales de pgAdmin

Las credenciales están en `apps/backend/.env`:

- Email: `PGADMIN_EMAIL`
- Password: `PGADMIN_PASSWORD`

### 3.5. Resetear la base de datos

Si necesitas eliminar todos los datos y empezar de cero:

```bash
cd apps/backend

# Detener contenedores y eliminar volúmenes
docker-compose down -v

# Volver a levantar con BD limpia
docker-compose up -d

# Ejecutar migraciones de nuevo
npm run db:migrate
```

El flag `-v` elimina los volúmenes de Docker, borrando completamente los datos de PostgreSQL.
