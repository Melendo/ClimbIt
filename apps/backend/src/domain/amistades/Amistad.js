class Amistad {
  constructor(id, idEscalador1, idEscalador2, fechaInicio = null) {
    if (!idEscalador1 || !idEscalador2) {
      throw new Error('Los identificadores de amistad son obligatorios');
    }

    if (idEscalador1 >= idEscalador2) {
      throw new Error(
        'La amistad debe almacenarse con idEscalador1 menor que idEscalador2'
      );
    }

    this.id = id;
    this.idEscalador1 = idEscalador1;
    this.idEscalador2 = idEscalador2;
    this.fechaInicio = fechaInicio;
  }
}

export default Amistad;
