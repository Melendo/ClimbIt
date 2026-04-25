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
}

export default AmistadController;