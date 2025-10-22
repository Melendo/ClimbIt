// --- 1. Importar Modelos (Infraestructura) ---
const { DataTypes } = require('sequelize'); // 👈 ¡NECESITAS ESTO!
const sequelize = require('./db/postgres/sequelize'); // 👈 ¡Y ESTO!

// --- 2. Importar la FÁBRICA de modelos ---
const EscaladorModelFactory = require('./db/postgres/models/escaladorModel');

// --- 3. LLAMAR a la fábrica para obtener el modelo real ---
// eslint-disable-next-line new-cap
const EscaladorModel = EscaladorModelFactory(sequelize, DataTypes);
// --- 2. Importar Repositorios (Infraestructura) ---
const EscaladorRepositoryPostgres = require('./repositories/EscaladorRepositoryPostgres');

// --- 3. Importar Casos de Uso (Aplicación) ---
const CrearEscalador = require('../application/escaladores/crearEscalador');

// --- 4. Importar Controladores (Interfaces) ---
const EscaladorController = require('../interfaces/http/controllers/escaladorController');

// --- 5. Instanciar y Componer (La Inyección) ---

// a. Crear instancia del Repositorio, inyectando el Modelo
const escaladorRepository = new EscaladorRepositoryPostgres(EscaladorModel);

// b. Crear instancia del Caso de Uso, inyectando el Repositorio
const crearEscaladorUseCase = new CrearEscalador(escaladorRepository);

// c. Crear un objeto con los casos de uso para el controlador
const escaladorUseCases = {
  crear: crearEscaladorUseCase,
};

// d. Crear instancia del Controlador, inyectando los Casos de Uso
const escaladorController = new EscaladorController(escaladorUseCases);

// --- 6. Exportar las instancias que se usarán en las rutas ---
module.exports = {
  escaladorController,
};
