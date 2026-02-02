import Escalador from '../../domain/escaladores/Escalador.js';
import bcrypt from 'bcrypt';

class CrearEscalador {
  constructor(escaladorRepository) {
    this.escaladorRepository = escaladorRepository;
  }

  async execute(data) {
    try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(data.contrasena, saltRounds);
      const nuevoEscalador = new Escalador(
        null,
        data.correo,
        hashedPassword,
        data.apodo
      );

      const escaladorCreado =
        await this.escaladorRepository.crear(nuevoEscalador);

      return escaladorCreado;
       
    } catch (error) {
      throw new Error(`Error al crear el escalador: ${error.message}`);
    }
  }
}

export default CrearEscalador;
