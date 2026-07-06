# ClimbIt
![Presentación de ClimbIt](docs/assets/presentacion.png)

ClimbIt es una Aplicación Web Progresiva (PWA) orientada a la gestión de rocódromos y al registro de sesiones de escalada. Nacida como Trabajo de Fin de Grado, permite a los usuarios gestionar su perfil y medir detalladamente su progreso, fomentando así la competición entre amigos.

## Descripción detallada
ClimbIt surge con el objetivo de digitalizar y simplificar la experiencia de escalada en rocódromo, conectando en una misma plataforma tanto a escaladores como a gestores de instalaciones. La aplicación permite pasar de un seguimiento informal del rendimiento a un control continuo, estructurado y medible de la actividad.

Como proyecto desarrollado en el contexto de un Trabajo de Fin de Grado, su enfoque combina utilidad práctica y base técnica sólida: autenticación segura, arquitectura modular, persistencia relacional, API REST y cliente web moderno con capacidades PWA. Esto permite que la herramienta sea útil tanto en escritorio como en móvil, incluyendo escenarios de conectividad limitada.

Además del seguimiento individual, ClimbIt incorpora una dimensión social para reforzar la motivación: comparación de actividad, perfiles públicos y gestión de amistades. El resultado es una plataforma que no solo organiza información de rocódromos y rutas, sino que también impulsa el progreso personal y la competición sana entre amigos.

En frontend está implementado como SPA hash-based y además incorpora capacidades PWA (service worker, caché de datos/imágenes y modo offline en lectura).

El sistema permite:
- Registro y autenticación con JWT.
- Gestión de perfil (apodo, descripción y foto de perfil).
- Suscripción/desuscripción a rocódromos.
- Consulta y edición de rocódromos, zonas y rutas según permisos.
- Carga de imágenes y recursos gráficos (logos, mapas SVG, imágenes de pistas).
- Seguimiento del progreso con estadísticas globales y por rocódromo.
- Funcionalidades sociales (amistades, solicitudes, perfil público y ranking mensual).

## Índice
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Ejecución y Uso](#ejecución-y-uso)
- [Arquitectura y Stack Tecnológico](#arquitectura-y-stack-tecnológico)
- [Contribuciones](#contribuciones)
- [Licencia y Créditos](#licencia-y-créditos)

## Requisitos Previos
Antes de comenzar, asegúrate de tener:
- Sistema operativo: Linux, macOS o Windows.
- Node.js: recomendado 20.x o superior.
- npm: incluido con Node.js.
- Docker y Docker Compose (o Docker con el subcomando docker compose).
- Git.

Notas relevantes del repositorio:
- El monorepo usa npm workspaces + Lerna.
- La configuración de npm endurece seguridad con ignore-scripts=true, por lo que se usa un paso allow-scripts para habilitar scripts permitidos.
- La base de datos es PostgreSQL y puede levantarse en contenedor sin instalación local de Postgres.

## Instalación
1. Clonar el repositorio:

```bash
git clone https://github.com/Melendo/ClimbIt.git
cd ClimbIt
```

2. Instalar dependencias de todo el monorepo:

```bash
npm run setup
```

Este comando instala dependencias y ejecuta allow-scripts para los paquetes con postinstall permitido.

3. Preparar entorno de backend:

```bash
cd apps/backend
cp .env.example .env
```

4. Volver a la raíz:

```bash
cd ../..
```

## Configuración
ClimbIt usa variables de entorno en la raíz y en backend. Para desarrollo local, el archivo mínimo necesario es apps/backend/.env.

### Variables de Entorno
| Variable | Descripción | Ejemplo | Requerido |
| :--- | :--- | :--- | :---: |
| PORT | Puerto del backend en local | 3000 | Sí |
| JWT_SECRET | Secreto de firma JWT | supersecreto | Sí |
| JWT_EXPIRES_IN | Expiración del token | 7d | Sí |
| POSTGRES_USER | Usuario de PostgreSQL | climbit | Sí |
| POSTGRES_PASSWORD | Contraseña de PostgreSQL | climbit_pwd | Sí |
| POSTGRES_DB | Nombre de base de datos | climbit_db | Sí |
| PGADMIN_EMAIL | Usuario de pgAdmin | admin@climbit.local | Sí |
| PGADMIN_PASSWORD | Contraseña de pgAdmin | admin_pwd | Sí |
| DATABASE_URL | Cadena de conexión de Sequelize | postgresql://user:pass@localhost:5432/db | Sí |
| ENV_NAME | Sufijo para nombres de contenedor (compose raíz) | local | No |
| API_PORT | Puerto publicado del backend (compose raíz) | 3000 | No |
| WEB_PORT | Puerto publicado del frontend nginx (compose raíz) | 80 | No |
| DB_PORT | Puerto publicado de PostgreSQL (compose raíz) | 5432 | No |
| PGADMIN_PORT | Puerto publicado de pgAdmin (compose raíz) | 5050 | No |

### Configuración de pgAdmin
1. Levanta los servicios de base de datos.
2. Abre http://localhost:5050.
3. Inicia sesión con PGADMIN_EMAIL y PGADMIN_PASSWORD.
4. Registra servidor con:
- Host: db
- Port: 5432
- Database: postgres
- Username: POSTGRES_USER
- Password: POSTGRES_PASSWORD

Importante: si pgAdmin corre dentro de Docker, usa host db, no localhost.

## Ejecución y Uso
### Desarrollo local (recomendado)
1. Levantar PostgreSQL y pgAdmin:

```bash
cd apps/backend
docker-compose up -d
```

2. Ejecutar migraciones:

```bash
npm run db:migrate
```

3. Volver a raíz y levantar backend + frontend en paralelo:

```bash
cd ../..
npm run dev
```

Servicios resultantes:
- Frontend (Vite): http://localhost:5173
- Backend (Express): http://localhost:3000
- pgAdmin: http://localhost:5050

### Ejecución completa con Docker Compose raíz
Desde la raíz:

```bash
docker compose up -d --build
```

Esto levanta:
- db (PostgreSQL)
- pgadmin
- backend (Node)
- frontend (Nginx sirviendo dist)

### Testing
Desde raíz:

```bash
npm run test
npm run test:coverage
```

Cobertura de backend en apps/backend/coverage.

### Calidad de código
Desde raíz:

```bash
npm run lint
npm run lint:fix
npm run format
```

También existe pre-commit con lint-staged vía Husky.

### Comandos de base de datos (backend)

```bash
cd apps/backend

npm run db:migrate
npm run db:migrate:undo
npm run db:migrate:new -- nombre-migracion

npm run db:seed
npm run db:seed:undo
npm run db:seed:new -- nombre-seed
```

### Funcionalidades principales de API
La API se organiza por módulos:
- /escaladores: autenticación, perfil, stats, fotos de perfil, suscripciones y búsqueda.
- /rocodromos: alta/listado/detalle/edición, logo y escalas de dificultad.
- /zonas: alta, listado de pistas por zona y mapa SVG.
- /pistas: alta/edición/borrado lógico, imagen, estado y valoración.
- /amistades: solicitudes, listado de amigos, perfil de amigo y eliminación.

### Frontend y navegación
Rutas de interfaz destacadas:
- #home, #login, #registro, #tutorial
- #misRocodromos, #buscarRocodromos, #infoRoco, #modificarRocodromo
- #crearRuta, #infoRuta, #modificarRuta, #mapaZona
- #perfil, #editarPerfil, #social, #amigoPerfil

Características de cliente:
- Token JWT en localStorage.
- Control de permisos en cliente para acciones de gestión.
- Warm-up de caché tras login para mejorar modo offline.
- PWA con Workbox y estrategias de cacheo para datos e imágenes.

### Solución de problemas comunes
1. Puerto ocupado:
- Ajusta PORT en apps/backend/.env y/o API_PORT, WEB_PORT, DB_PORT, PGADMIN_PORT en entorno compose.

2. Error de conexión a base de datos:
- Verifica docker ps.
- Revisa credenciales de apps/backend/.env.
- Valida DATABASE_URL.

3. Migraciones fallan:
- Asegura base de datos levantada.
- Ejecuta comandos desde apps/backend.

4. Reset completo de base de datos:

```bash
cd apps/backend
docker-compose down -v
docker-compose up -d
npm run db:migrate
```

## Arquitectura y Stack Tecnológico
### Arquitectura
Monorepo con dos aplicaciones principales en apps/backend y apps/frontend.

Backend:
- Node.js + Express 5.
- Estructura por capas:
  - application: casos de uso
  - domain: entidades, objetos de dominio, repositorios abstractos y errores de dominio
  - infrastructure: sequelize, repositorios postgres, seguridad (jwt/bcrypt), contenedor DI
  - interfaces/http: rutas, middlewares y controladores
- Persistencia con Sequelize sobre PostgreSQL.

Frontend:
- SPA con Vite, JavaScript modular y Bootstrap.
- Router hash-based.
- Integración PWA con vite-plugin-pwa y service worker.
- Nginx para despliegue estático y reverse proxy al backend en entorno docker.

Infraestructura:
- Docker Compose para local y despliegues.
- GitHub Actions para CI de Pull Requests y despliegues automáticos en ramas develop/main (entorno self-hosted).

### Stack Tecnológico
- Backend/Core: Node.js, Express, Sequelize, JWT, bcrypt, multer, express-validator.
- Base de datos: PostgreSQL 15.
- Frontend: Vite, Bootstrap 5, vite-plugin-pwa, panzoom.
- Testing: Jest + Supertest (backend).
- Calidad: ESLint (flat config) + Prettier + Husky + lint-staged.
- Orquestación/DevOps: Docker, Docker Compose, GitHub Actions.

## Contribuciones
Si deseas contribuir:
1. Haz fork del repositorio.
2. Crea una rama desde develop o main según corresponda.
3. Implementa cambios manteniendo estilo y scripts de calidad.
4. Ejecuta pruebas y lint antes de subir cambios:

```bash
npm run lint
npm run test
```

5. Haz commit con mensaje claro.
6. Publica tu rama y abre Pull Request explicando el objetivo, cambios y validaciones.

## Licencia y Créditos
### Licencia
Este proyecto está bajo la licencia Apache 2.0. Consulta el archivo LICENSE para más detalles.

### Créditos y Agradecimientos
- Autores: [Melendo](https://github.com/Melendo) y [Iván Alcalde](https://github.com/IAlcCamDev).
- Agradecimientos: A nuestro tutor del TFG Iván Martínez y a los rocódromos de UADIBLOC y Hoyo de Manzanares.
