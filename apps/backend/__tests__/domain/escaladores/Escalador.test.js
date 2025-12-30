import Escalador from '../../../src/domain/escaladores/Escalador.js';

describe('Escalador (Entidad de dominio)', () => {
  describe('Creación exitosa', () => {
    it('debería crear un escalador con los datos correctos', () => {
      const datos = {
        id: null,
        correo: 'ana@example.com',
        contrasena: 'secret',
        apodo: 'AnaClimb',
      };
      const escalador = new Escalador(
        datos.id,
        datos.correo,
        datos.contrasena,
        datos.apodo
      );

      expect(escalador.correo).toBe('ana@example.com');
      expect(escalador.contrasena).toBe('secret');
      expect(escalador.apodo).toBe('AnaClimb');
    });
  });

  describe('Validaciones', () => {
    it('no debería crear un escalador con correo vacío', () => {
      expect(() => new Escalador(null, '', 'pass', 'apodo')).toThrow(
        `correo inválido: Debe ser una cadena no vacía.`
      );
    });

    it('no debería crear un escalador con contraseña vacía', () => {
      expect(() => new Escalador(null, 'email', '', 'apodo')).toThrow(
        `contraseña inválida: Debe ser una cadena no vacía.`
      );
    });

    it('no debería crear un escalador con apodo vacío', () => {
      expect(() => new Escalador(null, 'email', 'pass', '')).toThrow(
        `apodo inválido: Debe ser una cadena no vacía.`
      );
    });
  });
});
