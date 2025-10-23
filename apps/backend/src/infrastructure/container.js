// Contenedor de dependencias:
// - Importa las fábricas/objetos de infraestructura (sequelize, modelos, repositorios)
// - Crea instancias (repositorios, casos de uso, controladores)
// - Exporta las instancias que usarán las rutas

// Importaciones de infraestructura
const { DataTypes } = require('sequelize');
const sequelize = require('./db/postgres/sequelize');

// Importar la fábrica del modelo Escalador (definición del modelo)
const escaladorModelFactory = require('./db/postgres/models/escaladorModel');

// Crear el modelo real a partir de la fábrica (inyección de sequelize y DataTypes)
const EscaladorModel = escaladorModelFactory(sequelize, DataTypes);

// Repositorios (implementación concreta que usa el modelo)
const EscaladorRepositoryPostgres = require('./repositories/EscaladorRepositoryPostgres');

// Casos de uso (lógica de aplicación)
const CrearEscalador = require('../application/escaladores/crearEscalador');

// Controladores (interfaces HTTP)
const EscaladorController = require('../interfaces/http/controllers/escaladorController');

// --- Composición / Inyección de dependencias ---

// 1) Instancia del repositorio con el modelo específico
const escaladorRepository = new EscaladorRepositoryPostgres(EscaladorModel);

// 2) Instancia del caso de uso con el repositorio inyectado
const crearEscaladorUseCase = new CrearEscalador(escaladorRepository);

// 3) Agrupar los casos de uso que el controlador necesitará
const escaladorUseCases = {
  crear: crearEscaladorUseCase,
};

// 4) Instancia del controlador con los casos de uso inyectados
const escaladorController = new EscaladorController(escaladorUseCases);

// Exportar las instancias que serán consumidas por las rutas
module.exports = {
  escaladorController,
};
