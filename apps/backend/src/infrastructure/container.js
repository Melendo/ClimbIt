// Contenedor de dependencias:
// - Importa las fábricas/objetos de infraestructura (sequelize, modelos, repositorios)
// - Crea instancias (repositorios, casos de uso, controladores)
// - Exporta las instancias que usarán las rutas

// Importaciones de infraestructura
import dbPromise from './db/postgres/models/index.js';

// Repositorios (implementación concreta que usa el modelo)
import EscaladorRepositoryPostgres from './repositories/escaladorRepositoryPostgres.js';
import PistaRepositoryPostgres from './repositories/pistaRepositoryPostgres.js';

// Casos de uso (lógica de aplicación)
import CrearEscalador from '../application/escaladores/crearEscalador.js';
import CrearPista from '../application/pistas/crearPista.js';

// Controladores (interfaces HTTP)
import EscaladorController from '../interfaces/http/controllers/escaladorController.js';
import PistaController from '../interfaces/http/controllers/pistaController.js';

// --- Composición / Inyección de dependencias ---

// Función asíncrona para inicializar el contenedor
async function inicializarContainer() {
  // Esperar a que se carguen los modelos
  const db = await dbPromise;

  // 1) Instancia del repositorio con el modelo específico
  const escaladorRepository = new EscaladorRepositoryPostgres(db.Escalador);
  const pistaRepository = new PistaRepositoryPostgres(db.Pista);

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

  // Retornar las instancias que serán consumidas por las rutas
  return { escaladorController, pistaController };
}

// Exportar la promesa del contenedor inicializado
export default inicializarContainer();
