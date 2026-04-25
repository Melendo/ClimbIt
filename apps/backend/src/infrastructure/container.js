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
import FotosPerfilRepositoryPostgres from './repositories/fotosPerfilRepositoryPostgres.js';
import SolicitudAmistadRepositoryPostgres from './repositories/solicitudAmistadRepositoryPostgres.js';
import AmistadRepositoryPostgres from './repositories/amistadRepositoryPostgres.js';

// Servicios de infra (Seguridad etc)
import passwordService from './security/passwordService.js';
import tokenService from './security/tokenService.js';

// Casos de uso (lógica de aplicación)
import CrearEscalador from '../application/escaladores/crearEscalador.js';
import AutenticarEscalador from '../application/escaladores/autenticarEscalador.js';
import ObtenerPerfil from '../application/escaladores/obtenerPerfilEscaladror.js';
import SuscribirseRocodromo from '../application/escaladores/suscribirseRocodromo.js';
import DesuscribirseRocodromo from '../application/escaladores/desuscribirseRocodromo.js';
import ObtenerRocodromosSuscritos from '../application/escaladores/obtenerRocodromosSuscritos.js';
import CrearFotoPerfil from '../application/escaladores/crearFotoPerfil.js';
import ObtenerFotosPerfil from '../application/escaladores/obtenerFotosPerfil.js';
import ObtenerFotoPerfil from '../application/escaladores/obtenerFotoPerfil.js';
import ActualizarFotoPerfilEscalador from '../application/escaladores/actualizarFotoPerfilEscalador.js';
import ValidarApodoEscalador from '../application/escaladores/validarApodoEscalador.js';
import ValidarCorreoEscalador from '../application/escaladores/validarCorreoEscalador.js';
import ActualizarDescripcionEscalador from '../application/escaladores/actualizarDescripcionEscalador.js';
import CambiarApodoEscalador from '../application/escaladores/cambiarApodoEscalador.js';
import ObtenerResumenEstadisticasEscalador from '../application/escaladores/obtenerResumenEstadisticasEscalador.js';
import ObtenerTiposEstadisticasEscalador from '../application/escaladores/obtenerTiposEstadisticasEscalador.js';
import ObtenerActividadMensualEscalador from '../application/escaladores/obtenerActividadMensualEscalador.js';
import ObtenerResumenEstadisticasRocodromoEscalador from '../application/escaladores/obtenerResumenEstadisticasRocodromoEscalador.js';
import ObtenerTiposEstadisticasRocodromoEscalador from '../application/escaladores/obtenerTiposEstadisticasRocodromoEscalador.js';
import ObtenerActividadMensualRocodromoEscalador from '../application/escaladores/obtenerActividadMensualRocodromoEscalador.js';
import ObtenerDificultadMaximaRocodromoEscalador from '../application/escaladores/obtenerDificultadMaximaRocodromoEscalador.js';

import CrearPista from '../application/pistas/crearPista.js';
import ActualizarPista from '../application/pistas/actualizarPista.js';
import ActualizarImagenPista from '../application/pistas/actualizarImagenPista.js';
import ObtenerPistaPorId from '../application/pistas/obtenerPistaPorId.js';
import CambiarEstadoPista from '../application/pistas/cambiarEstadoPista.js';
import ActualizarValoracion from '../application/pistas/actualizarValoracion.js';
import ObtenerValoracionTotal from '../application/pistas/obtenerValoracionTotal.js';
import EliminarPista from '../application/pistas/eliminarPista.js';

import CrearZona from '../application/zonas/crearZona.js';
import ObtenerPistasDeZona from '../application/zonas/obtenerPistasZona.js';
import ActualizarMapaZona from '../application/zonas/actualizarMapaZona.js';
import ObtenerZonaPorId from '../application/zonas/obtenerZonaPorId.js';

import CrearRocodromo from '../application/rocodromos/crearRocodromo.js';
import ActualizarInformacionRocodromo from '../application/rocodromos/actualizarInformacionRocodromo.js';
import ActualizarLogoRocodromo from '../application/rocodromos/actualizarLogoRocodromo.js';
import ObtenerZonasRocodromo from '../application/rocodromos/obtenerZonasRocodromo.js';
import ObtenerRocodromos from '../application/rocodromos/obtenerRocodromos.js';
import ObtenerInformacionRocodromo from '../application/rocodromos/obtenerInformacionRocodromo.js';
import ObtenerEscalasDificultad from '../application/rocodromos/obtenerEscalasDificultad.js';

import EnviarSolicitudAmistad from '../application/amistades/enviarSolicitudAmistad.js';

// Controladores (interfaces HTTP)
import EscaladorController from '../interfaces/http/controllers/escaladorController.js';
import PistaController from '../interfaces/http/controllers/pistaController.js';
import ZonaController from '../interfaces/http/controllers/zonaController.js';
import RocodromoController from '../interfaces/http/controllers/rocodromoController.js';
import AmistadController from '../interfaces/http/controllers/amistadController.js';

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
  const fotosPerfilRepository = new FotosPerfilRepositoryPostgres(db.FotosPerfil);
  const solicitudAmistadRepository = new SolicitudAmistadRepositoryPostgres(
    db.SolicitudAmistad
  );
  const amistadRepository = new AmistadRepositoryPostgres(db.Amistad);

  // 2) Instancia del caso de uso con el repositorio inyectado
  const crearEscaladorUseCase = new CrearEscalador(
    escaladorRepository,
    passwordService,
    tokenService
  );
  const autenticarEscaladorUseCase = new AutenticarEscalador(
    escaladorRepository,
    passwordService,
    tokenService
  );
  const obtenerPerfilUseCase = new ObtenerPerfil(escaladorRepository);
  const suscribirseRocodromoUseCase = new SuscribirseRocodromo(
    escaladorRepository,
    rocodromoRepository
  );
  const desuscribirseRocodromoUseCase = new DesuscribirseRocodromo(
    escaladorRepository,
    rocodromoRepository
  );
  const obtenerRocodromosSuscritosUseCase = new ObtenerRocodromosSuscritos(
    escaladorRepository
  );
  const crearFotoPerfilUseCase = new CrearFotoPerfil(fotosPerfilRepository);
  const obtenerFotosPerfilUseCase = new ObtenerFotosPerfil(fotosPerfilRepository);
  const obtenerFotoPerfilUseCase = new ObtenerFotoPerfil(fotosPerfilRepository);
  const actualizarFotoPerfilUseCase = new ActualizarFotoPerfilEscalador(
    escaladorRepository,
    fotosPerfilRepository
  );
  const validarApodoUseCase = new ValidarApodoEscalador(escaladorRepository);
  const validarCorreoUseCase = new ValidarCorreoEscalador(escaladorRepository);
  const actualizarDescripcionUseCase = new ActualizarDescripcionEscalador(
    escaladorRepository
  );
  const cambiarApodoUseCase = new CambiarApodoEscalador(
    escaladorRepository,
    tokenService
  );
  const obtenerResumenEstadisticasUseCase =
    new ObtenerResumenEstadisticasEscalador(
      escaladorRepository,
      pistaRepository
    );
  const obtenerTiposEstadisticasUseCase =
    new ObtenerTiposEstadisticasEscalador(escaladorRepository, pistaRepository);
  const obtenerActividadMensualUseCase =
    new ObtenerActividadMensualEscalador(escaladorRepository, pistaRepository);
  const obtenerResumenEstadisticasRocodromoUseCase =
    new ObtenerResumenEstadisticasRocodromoEscalador(
      escaladorRepository,
      rocodromoRepository,
      pistaRepository
    );
  const obtenerTiposEstadisticasRocodromoUseCase =
    new ObtenerTiposEstadisticasRocodromoEscalador(
      escaladorRepository,
      rocodromoRepository,
      pistaRepository
    );
  const obtenerActividadMensualRocodromoUseCase =
    new ObtenerActividadMensualRocodromoEscalador(
      escaladorRepository,
      rocodromoRepository,
      pistaRepository
    );
  const obtenerDificultadMaximaRocodromoUseCase =
    new ObtenerDificultadMaximaRocodromoEscalador(
      escaladorRepository,
      rocodromoRepository,
      pistaRepository
    );

  const crearPistaUseCase = new CrearPista(
    pistaRepository,
    db.Zona,
    rocodromoRepository
  );
  const actualizarPistaUseCase = new ActualizarPista(
    pistaRepository,
    db.Zona,
    rocodromoRepository
  );
  const actualizarImagenPistaUseCase = new ActualizarImagenPista(pistaRepository);
  const obtenerPistaPorIdUseCase = new ObtenerPistaPorId(pistaRepository, escaladorRepository);
  const cambiarEstadoPistaUseCase = new CambiarEstadoPista(
    pistaRepository,
    escaladorRepository
  );
  const actualizarValoracionUseCase = new ActualizarValoracion(
    pistaRepository,
    escaladorRepository
  );
  const obtenerValoracionTotalUseCase = new ObtenerValoracionTotal(pistaRepository);
  const eliminarPistaUseCase = new EliminarPista(pistaRepository);

  const crearZonaUseCase = new CrearZona(zonaRepository, db.Rocodromo);
  const obtenerPistasDeZonaUseCase = new ObtenerPistasDeZona(zonaRepository, escaladorRepository);
  const actualizarMapaZonaUseCase = new ActualizarMapaZona(zonaRepository);
  const obtenerZonaPorIdUseCase = new ObtenerZonaPorId(zonaRepository);

  const crearRocodromoUseCase = new CrearRocodromo(rocodromoRepository);
  const actualizarInformacionRocodromoUseCase = new ActualizarInformacionRocodromo(
    rocodromoRepository,
    db.EscalaDificultad
  );
  const actualizarLogoRocodromoUseCase = new ActualizarLogoRocodromo(
    rocodromoRepository
  );
  const obtenerZonasRocodromoUseCase = new ObtenerZonasRocodromo(
    rocodromoRepository
  );
  const obtenerRocodromosUseCase = new ObtenerRocodromos(rocodromoRepository);
  const obtenerInformacionRocodromoUseCase = new ObtenerInformacionRocodromo(
    rocodromoRepository
  );
  const obtenerEscalasDificultadUseCase = new ObtenerEscalasDificultad(
    rocodromoRepository
  );
  const enviarSolicitudAmistadUseCase = new EnviarSolicitudAmistad(
    escaladorRepository,
    solicitudAmistadRepository,
    amistadRepository
  );

  // 3) Instancia del caso de uso con el repositorio inyectado
  const escaladorUseCases = {
    crear: crearEscaladorUseCase,
    autenticar: autenticarEscaladorUseCase,
    obtenerPerfil: obtenerPerfilUseCase,
    suscribirseRocodromo: suscribirseRocodromoUseCase,
    desuscribirseRocodromo: desuscribirseRocodromoUseCase,
    obtenerRocodromosSuscritos: obtenerRocodromosSuscritosUseCase,
    crearFotoPerfil: crearFotoPerfilUseCase,
    obtenerFotosPerfil: obtenerFotosPerfilUseCase,
    obtenerFotoPerfil: obtenerFotoPerfilUseCase,
    actualizarFotoPerfil: actualizarFotoPerfilUseCase,
    validarApodo: validarApodoUseCase,
    validarCorreo: validarCorreoUseCase,
    actualizarDescripcion: actualizarDescripcionUseCase,
    cambiarApodo: cambiarApodoUseCase,
    obtenerResumenEstadisticas: obtenerResumenEstadisticasUseCase,
    obtenerTiposEstadisticas: obtenerTiposEstadisticasUseCase,
    obtenerActividadMensual: obtenerActividadMensualUseCase,
    obtenerResumenEstadisticasRocodromo:
      obtenerResumenEstadisticasRocodromoUseCase,
    obtenerTiposEstadisticasRocodromo: obtenerTiposEstadisticasRocodromoUseCase,
    obtenerActividadMensualRocodromo:
      obtenerActividadMensualRocodromoUseCase,
    obtenerDificultadMaximaRocodromo:
      obtenerDificultadMaximaRocodromoUseCase,
  };
  const pistaUseCases = {
    crear: crearPistaUseCase,
    actualizar: actualizarPistaUseCase,
    actualizarImagen: actualizarImagenPistaUseCase,
    obtenerPistaPorId: obtenerPistaPorIdUseCase,
    cambiarEstado: cambiarEstadoPistaUseCase,
    actualizarValoracion: actualizarValoracionUseCase,
    obtenerValoracionTotal: obtenerValoracionTotalUseCase,
    eliminar: eliminarPistaUseCase,
  };
  const zonaUseCases = {
    crear: crearZonaUseCase,
    obtenerPistasDeZona: obtenerPistasDeZonaUseCase,
    actualizarMapa: actualizarMapaZonaUseCase,
    obtenerZonaPorId: obtenerZonaPorIdUseCase,
  };
  const rocodromoUseCases = {
    crear: crearRocodromoUseCase,
    actualizarInformacion: actualizarInformacionRocodromoUseCase,
    actualizarLogo: actualizarLogoRocodromoUseCase,
    obtenerZonasRocodromo: obtenerZonasRocodromoUseCase,
    obtenerRocodromos: obtenerRocodromosUseCase,
    obtenerInformacion: obtenerInformacionRocodromoUseCase,
    obtenerEscalasDificultad: obtenerEscalasDificultadUseCase,
  };
  const amistadUseCases = {
    enviarSolicitud: enviarSolicitudAmistadUseCase,
  };

  // 4) Instancia del controlador con los casos de uso inyectados
  const escaladorController = new EscaladorController(escaladorUseCases);
  const pistaController = new PistaController(pistaUseCases);
  const zonaController = new ZonaController(zonaUseCases);
  const rocodromoController = new RocodromoController(rocodromoUseCases);
  const amistadController = new AmistadController(amistadUseCases);

  // 5) Retornar las instancias que serán consumidas por las rutas
  return {
    escaladorController,
    pistaController,
    zonaController,
    rocodromoController,
    amistadController,
  };
}

// Exportar la promesa del contenedor inicializado
export default inicializarContainer();
