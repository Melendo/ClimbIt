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
}

export default AmistadController;