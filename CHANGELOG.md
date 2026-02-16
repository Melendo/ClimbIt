# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
- **Pistas**:
  - Listado de pistas por zona con información visual.
  - Detalle individual de la pista.
  - Actualización de estado (flash, completado y proyecto).

#### Infraestructura y DevOps
- **Despliegue Continuo (CD)**: Pipeline automatizado con GitHub Actions.
- **Integración Continua (CI)**: Workflow de testing automatizado con Jest y PostgreSQL en Pull Requests (`ClimbIt-CI`).
- **Entornos Aislados**: Configuración Multi-entorno (Desarrollo: `dev.climbit.es` / Producción: `app.climbit.es`).
- **Contenedores**: Orquestación completa con Docker y Docker Compose (PostgreSQL, Node.js Backend, Frontend).
- **Proxy**: Cloudflare Tunnel para gestión de DNS segura y acceso remoto.


