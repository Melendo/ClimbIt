class AmistadController {
  constructor(amistadUseCases) {
    this.useCases = amistadUseCases;
  }

  async enviarSolicitud(req, res, next) {
    try {
      const apodoRemitente = req.user.apodo;
      const { apodoDestinatario } = req.body;

      const resultado = await this.useCases.enviarSolicitud.execute({
        apodoRemitente,
        apodoDestinatario,
      });

      res.status(201).json(resultado);
    } catch (error) {
      return next(error);
    }
  }

  async responderSolicitud(req, res, next) {
    try {
      const apodoDestinatario = req.user.apodo;
      const { idSolicitud, respuesta } = req.body;

      const resultado = await this.useCases.responderSolicitud.execute({
        apodoDestinatario,
        idSolicitud,
        respuesta,
      });

      res.status(200).json(resultado);
    } catch (error) {
      return next(error);
    }
  }

  async listarAmigos(req, res, next) {
    try {
      const apodoEscalador = req.user.apodo;
      const resultado = await this.useCases.listarAmigos.execute({ apodoEscalador });
      res.status(200).json(resultado);
    } catch (error) {
      return next(error);
    }
  }

  async consultarPerfilAmigo(req, res, next) {
    try {
      const apodoSolicitante = req.user.apodo;
      const { apodo } = req.params;

      const resultado = await this.useCases.consultarPerfilAmigo.execute({
        apodoSolicitante,
        apodoPerfil: apodo,
      });

      res.status(200).json(resultado);
    } catch (error) {
      return next(error);
    }
  }

  async listarSolicitudesPendientes(req, res, next) {
    try {
      const apodoEscalador = req.user.apodo;
      const resultado = await this.useCases.listarSolicitudesPendientes.execute({ apodoEscalador });
      res.status(200).json(resultado);
    } catch (error) {
      return next(error);
    }
  }


  async eliminarAmigo(req, res, next) {
    try {
      const apodoSolicitante = req.user.apodo;
      const { apodoAmigo } = req.params;

      const resultado = await this.useCases.eliminarAmigo.execute({
        apodoSolicitante,
        apodoAmigo,
      });

      res.status(200).json(resultado);
    } catch (error) {
      return next(error);
    }
  }
}

export default AmistadController;