import Pista from '../../../../src/domain/pistas/Pista.js';

describe('Pista (Entidad de dominio)', () => {
  describe('Creación exitosa', () => {
    it('debería crear una pista con los datos correctos', () => {
      const datos = { id: null, idZona: 1, nombre: 'Ex1', dificultad: '3a' };
      const pista = new Pista(
        datos.id,
        datos.idZona,
        datos.nombre,
        datos.dificultad
      );

      expect(pista.idZona).toBe(1);
      expect(pista.nombre).toBe('Ex1');
      expect(pista.dificultad).toBe('3a');
    });

    it('debería crear una pista con ID numérico', () => {
      const pista = new Pista(1, 2, 'Overhang', '7c');
      expect(pista.id).toBe(1);
      expect(pista.idZona).toBe(2);
      expect(pista.nombre).toBe('Overhang');
      expect(pista.dificultad).toBe('7c');
    });
  });

  describe('Validaciones de nombre', () => {
    it('no debería crear una pista con nombre vacío', () => {
      expect(() => new Pista(null, 1, '', '6a')).toThrow(
        'nombre inválido: Debe ser una cadena no vacía.'
      );
    });

    it('no debería crear una pista con nombre solo espacios', () => {
      expect(() => new Pista(null, 1, '   ', '6a')).toThrow(
        'nombre inválido: Debe ser una cadena no vacía.'
      );
    });

    it('no debería crear una pista con nombre no string', () => {
      expect(() => new Pista(null, 1, 123, '6a')).toThrow(
        'nombre inválido: Debe ser una cadena no vacía.'
      );
    });

    it('no debería crear una pista con nombre undefined', () => {
      expect(() => new Pista(null, 1, undefined, '6a')).toThrow(
        'nombre inválido: Debe ser una cadena no vacía.'
      );
    });
  });

  describe('Validaciones de dificultad', () => {
    it('no debería crear una pista con dificultad vacía', () => {
      expect(() => new Pista(null, 1, 'Pista Test', '')).toThrow(
        'dificultad inválida: Debe ser una cadena no vacía.'
      );
    });
  });

  describe('Validaciones de idZona', () => {
    it('no debería crear una pista con idZona no entero', () => {
      expect(() => new Pista(null, '1', 'Pista Test', '6a')).toThrow(
        'idZona inválido: Debe ser un número entero.'
      );
    });
  });
});
