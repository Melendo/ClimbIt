// Contenedor de dependencias:
// - Importa las fábricas/objetos de infraestructura (sequelize, modelos, repositorios)
// - Crea instancias (repositorios, casos de uso, controladores)
// - Exporta las instancias que usarán las rutas

// Importaciones de infraestructura
import dbPromise from './db/postgres/models/index.js';

// Repositorios (implementación concreta que usa el modelo)
import EscaladorRepositoryPostgres from './repositories/escaladorRepositoryPostgres.js';
import PistaRepositoryPostgres from './repositories/pistaRepositoryPostgres.js';
import ZonaRepositoryPostgres from './repositories/zonaRepositoryPostgres.js';
import RocodromoRepositoryPostgres from './repositories/rocodromoRepositoryPostgres.js';

// Casos de uso (lógica de aplicación)
import CrearEscalador from '../application/escaladores/crearEscalador.js';
import CrearPista from '../application/pistas/crearPista.js';
import ObtenerPistaPorId from '../application/pistas/obtenerPistaPorId.js';
import ObtenerPistasDeZona from '../application/zonas/obtenerPistasZona.js';
import ObtenerZonasRocodromo from '../application/rocodromos/obtenerZonasRocodromo.js';

// Controladores (interfaces HTTP)
import EscaladorController from '../interfaces/http/controllers/escaladorController.js';
import PistaController from '../interfaces/http/controllers/pistaController.js';
import ZonaController from '../interfaces/http/controllers/zonaController.js';
import RocodromoController from '../interfaces/http/controllers/rocodromoController.js';

// --- Composición / Inyección de dependencias ---

// Función asíncrona para inicializar el contenedor
async function inicializarContainer() {
  // Esperar a que se carguen los modelos
  const db = await dbPromise;

  // 1) Instancia del repositorio con el modelo específico
  const escaladorRepository = new EscaladorRepositoryPostgres(db.Escalador);
  const pistaRepository = new PistaRepositoryPostgres(db.Pista);
  const zonaRepository = new ZonaRepositoryPostgres(db.Zona);
  const rocodromoRepository = new RocodromoRepositoryPostgres(db.Rocodromo);

  // 2) Instancia del caso de uso con el repositorio inyectado
  const crearEscaladorUseCase = new CrearEscalador(escaladorRepository);
  const crearPistaUseCase = new CrearPista(pistaRepository, db.Zona);
  const obtenerPistaPorIdUseCase = new ObtenerPistaPorId(pistaRepository);
  const obtenerPistasDeZonaUseCase = new ObtenerPistasDeZona(zonaRepository);
  const obtenerZonasRocodromoUseCase = new ObtenerZonasRocodromo(
    rocodromoRepository
  );
  // 3) Agrupar los casos de uso que el controlador necesitará
  const escaladorUseCases = {
    crear: crearEscaladorUseCase,
  };
  const pistaUseCases = {
    crear: crearPistaUseCase,
    obtenerPistaPorId: obtenerPistaPorIdUseCase,
  };
  const zonaUseCases = {
    obtenerPistasDeZona: obtenerPistasDeZonaUseCase,
  };
  const rocodromoUseCases = {
    obtenerZonasRocodromo: obtenerZonasRocodromoUseCase,
  };

  // 4) Instancia del controlador con los casos de uso inyectados
  const escaladorController = new EscaladorController(escaladorUseCases);
  const pistaController = new PistaController(pistaUseCases);
  const zonaController = new ZonaController(zonaUseCases);
  const rocodromoController = new RocodromoController(rocodromoUseCases);

  // 5) Retornar las instancias que serán consumidas por las rutas
  return {
    escaladorController,
    pistaController,
    zonaController,
    rocodromoController,
  };
}

// Exportar la promesa del contenedor inicializado
export default inicializarContainer();
