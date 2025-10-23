const Escalador = require('../../../src/domain/escaladores/Escalador');

describe('Escalador (Entidad de dominio)', () => {
  describe('Creación exitosa', () => {
    it('debería crear un escalador con los datos correctos', () => {
      const datos = {
        id: null,
        nombre: 'Ana',
        edad: 28,
        experiencia: 'Avanzado',
      };
      const escalador = new Escalador(
        datos.id,
        datos.nombre,
        datos.edad,
        datos.experiencia
      );

      expect(escalador.nombre).toBe('Ana');
      expect(escalador.edad).toBe(28);
      expect(escalador.experiencia).toBe('Avanzado');
    });

    it('debería crear un escalador con experiencia por defecto (Principiante)', () => {
      const escalador = new Escalador(1, 'Pedro', 30);
      expect(escalador.experiencia).toBe('Principiante');
    });
  });

  describe('Validaciones de experiencia', () => {
    it('no debería crear un escalador con nivel de experiencia inválido', () => {
      expect(() => new Escalador(null, 'Ana', 28, 'avanzado')).toThrow(
        `experiencia inválida: "avanzado". Debe ser uno de: ${Escalador.EXPERIENCIAS.join(', ')}`
      );
    });

    it('no debería crear un escalador con experiencia vacía', () => {
      expect(() => new Escalador(null, 'Ana', 28, '')).toThrow(
        `experiencia inválida: "". Debe ser uno de: ${Escalador.EXPERIENCIAS.join(', ')}`
      );
    });
  });

  describe('Validaciones de edad', () => {
    it('no debería crear un escalador con edad negativa', () => {
      expect(() => new Escalador(null, 'Ana', -5, 'Avanzado')).toThrow(
        'edad inválida: "-5". Debe ser un entero positivo.'
      );
    });

    it('no debería crear un escalador con edad cero', () => {
      expect(() => new Escalador(null, 'Ana', 0, 'Avanzado')).toThrow(
        'edad inválida: "0". Debe ser un entero positivo.'
      );
    });

    it('no debería crear un escalador con edad decimal', () => {
      expect(() => new Escalador(null, 'Ana', 28.5, 'Avanzado')).toThrow(
        'edad inválida: "28.5". Debe ser un entero positivo.'
      );
    });

    it('no debería crear un escalador con edad no numérica', () => {
      expect(
        () => new Escalador(null, 'Ana', 'veintiocho', 'Avanzado')
      ).toThrow('edad inválida: "veintiocho". Debe ser un entero positivo.');
    });
  });

  describe('Validaciones de nombre', () => {
    it('no debería crear un escalador con nombre vacío', () => {
      expect(() => new Escalador(null, '', 28, 'Avanzado')).toThrow(
        'nombre inválido: "". Debe ser una cadena no vacía.'
      );
    });

    it('no debería crear un escalador con nombre solo espacios', () => {
      expect(() => new Escalador(null, '   ', 28, 'Avanzado')).toThrow(
        'nombre inválido: "   ". Debe ser una cadena no vacía.'
      );
    });

    it('no debería crear un escalador con nombre no string', () => {
      expect(() => new Escalador(null, 123, 28, 'Avanzado')).toThrow(
        'nombre inválido: "123". Debe ser una cadena no vacía.'
      );
    });

    it('no debería crear un escalador con nombre undefined', () => {
      expect(() => new Escalador(null, undefined, 28, 'Avanzado')).toThrow(
        'nombre inválido: "undefined". Debe ser una cadena no vacía.'
      );
    });
  });
});
