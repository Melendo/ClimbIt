import Escalador from '../../domain/escaladores/Escalador.js';
import { hashPassword } from '../helpers/hashPasswordService.js';
class CrearEscalador {
  constructor(escaladorRepository) {
    this.escaladorRepository = escaladorRepository;
  }

  async execute(data) {
    try {
      const hashedPassword = await hashPassword(data.contrasena);
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
