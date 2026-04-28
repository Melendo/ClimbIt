class SolicitudAmistad {
  constructor(id, idRemitente, idDestinatario, estado, fechaCreacion = null) {
    if (!idRemitente || !idDestinatario) {
      throw new Error('Los identificadores de solicitud son obligatorios');
    }

    if (idRemitente === idDestinatario) {
      throw new Error(
        'Un escalador no puede enviarse una solicitud a sí mismo'
      );
    }

    const estadosValidos = ['pendiente', 'aceptada', 'rechazada'];
    if (estado && !estadosValidos.includes(estado)) {
      throw new Error('Estado de solicitud inválido');
    }

    this.id = id;
    this.idRemitente = idRemitente;
    this.idDestinatario = idDestinatario;
    this.estado = estado || 'pendiente';
    this.fechaCreacion = fechaCreacion;
  }
}

export default SolicitudAmistad;
