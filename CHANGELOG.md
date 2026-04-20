# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.1] - 2026-04-20

### Arreglado

#### Funcionalidades Usuario
- **Rutas**:
  - Arreglado el hitbox de las rutas en los mapas de zona

### Modificado

#### Funcionalidades Usuario
- **Rocódromos**:
  - Modificada la vista de la información de rocódromo
- **Rutas**:
  - Redistribución de los formularios de creación y modificación de ruta
- **Autenticación**:
  - Cambiado el tiempo de sesión a 12h

### Seguridad

- Mejoras de seguridad

## [0.2.0] - 2026-04-16

### Añadido

#### Funcionalidades Usuario
- **Autenticación**:
  - Registro e inicio de sesión mas fluido
- **Perfil**:
  - Edición de apodo.
  - Edición de descripción.
  - Cambio de foto de perfil desde una galería disponible.
  - Visualización ampliada del perfil con estadísticas.
- **Rocódromos**:
  - Actualizadas tarjetas de rocódromos
  - Visualización de información de un rocódromo.
  - Subida y actualización de información del rocódromo.
  - Consulta de zonas y escalas de dificultad.
  - Visualización de estadísticas del escalador por rocódromo.
- **Zonas**:
  - Visualización del mapa dinámico de cada zona.
  - Mejora de la interfaz en las zonas
  - Filtrado de rutas en base a tipo y dificultad
- **Rutas**:
  - Visualización de información de una ruta.
  - Valoración de rutas.
  - Creación de rutas
  - Edición de datos de ruta.
  - Borrado lógico de rutas.
- **Estadísticas**:
  - Resumen global de actividad del escalador.
  - Distribución por tipos de ruta.
  - Actividad mensual.
  - Dificultad máxima por rocódromo.
  - Estadísticas públicas por apodo.
- **Experiencia móvil**:
  - Aplicación instalable como PWA.
  - Soporte visual adaptado a móvil.
  - Modo de lectura sin conexión.

## [0.1.0] - 2026-02-16

### Añadido

#### Funcionalidades Usuario
- **Autenticación**: 
  - Inicio de sesión (correo/contraseña)
  - Registro de nuevos usuarios
  - Cierre de sesión
- **Perfil**: 
  - Visualización de información básica (nombre y correo).
- **Rocódromos**:
  - Buscador global de rocódromos.
  - Suscripción y desuscripción.
  - Listado de "Mis Rocódromos" para acceso rápido.
  - Navegación por zonas de los rocódromos.
- **Rutas**:
  - Listado de rutas por zona con información visual.
  - Detalle individual de la ruta.
  - Actualización de estado (flash, completado y proyecto).

#### Infraestructura y DevOps
- **Despliegue Continuo (CD)**: Pipeline automatizado con GitHub Actions.
- **Integración Continua (CI)**: Workflow de testing automatizado con Jest y PostgreSQL en Pull Requests (`ClimbIt-CI`).
- **Entornos Aislados**: Configuración Multi-entorno (Desarrollo: `dev.climbit.es` / Producción: `app.climbit.es`).
- **Contenedores**: Orquestación completa con Docker y Docker Compose (PostgreSQL, Node.js Backend, Frontend).
- **Proxy**: Cloudflare Tunnel para gestión de DNS segura y acceso remoto.


