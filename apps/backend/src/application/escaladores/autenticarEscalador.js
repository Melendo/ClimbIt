import { comparePassword } from '../helpers/hashPasswordService.js';
import { generateToken } from '../helpers/tokenService.js';

class AutenticarEscalador {
  constructor(escaladorRepository) {
    this.escaladorRepository = escaladorRepository;
  }

  async execute(data) {
    try {
      const escaladorExistente =
        await this.escaladorRepository.encontrarPorCorreo(data.correo);
      if (!escaladorExistente) {
        throw new Error('Escalador no encontrado');
      }

      const passwordMatch = await comparePassword(
        data.contrasena,
        escaladorExistente.contrasena
      );
      if (!passwordMatch) {
        throw new Error('Contraseña incorrecta');
      }
      const token = generateToken({ correo: escaladorExistente.correo });
      return { token };
    } catch (error) {
      throw new Error(`Error al autenticar al escalador: ${error.message}`);
    }
  }
}

export default AutenticarEscalador;
