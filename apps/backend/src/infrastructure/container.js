// Contenedor de dependencias:
// - Importa las fábricas/objetos de infraestructura (sequelize, modelos, repositorios)
// - Crea instancias (repositorios, casos de uso, controladores)
// - Exporta las instancias que usarán las rutas

// Importaciones de infraestructura
const { DataTypes } = require('sequelize');
const sequelize = require('./db/postgres/sequelize');

// Importar la fábrica de los modelos
const escaladorModelFactory = require('./db/postgres/models/escaladorModel');
const pistaModelFactory = require('./db/postgres/models/pistaModel');

// Crear el modelo real a partir de la fábrica (inyección de sequelize y DataTypes)
const EscaladorModel = escaladorModelFactory(sequelize, DataTypes);
const PistaModel = pistaModelFactory(sequelize, DataTypes);

// Repositorios (implementación concreta que usa el modelo)
const EscaladorRepositoryPostgres = require('./repositories/EscaladorRepositoryPostgres');
const PistaRepositoryPostgres = require('./repositories/PistaRepositoryPostgres');

// Casos de uso (lógica de aplicación)
const CrearEscalador = require('../application/escaladores/crearEscalador');
const CrearPista = require('../application/pistas/crearPista');

// Controladores (interfaces HTTP)
const EscaladorController = require('../interfaces/http/controllers/escaladorController');
const PistaController = require('../interfaces/http/controllers/pistaController');

// --- Composición / Inyección de dependencias ---

// 1) Instancia del repositorio con el modelo específico
const escaladorRepository = new EscaladorRepositoryPostgres(EscaladorModel);
const pistaRepository = new PistaRepositoryPostgres(PistaModel);

// 2) Instancia del caso de uso con el repositorio inyectado
const crearEscaladorUseCase = new CrearEscalador(escaladorRepository);
const crearPistaUseCase = new CrearPista(pistaRepository);

// 3) Agrupar los casos de uso que el controlador necesitará
const escaladorUseCases = {
  crear: crearEscaladorUseCase,
};
const pistaUseCases = {
  crear: crearPistaUseCase,
};

// 4) Instancia del controlador con los casos de uso inyectados
const escaladorController = new EscaladorController(escaladorUseCases);
const pistaController = new PistaController(pistaUseCases);

// Exportar las instancias que serán consumidas por las rutas
module.exports = {
  escaladorController,
  pistaController,
};
