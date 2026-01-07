import { describe, it, expect } from '@jest/globals';
import Zona from '../../../../src/domain/zonas/Zona.js';

describe('Zona (Entidad de dominio)', () => {
  describe('Creación exitosa', () => {
    it('debería crear una zona con los datos correctos', () => {
      const datos = { id: null, idRoco: 1, nombre: 'Zona Norte' };
      const zona = new Zona(datos.id, datos.idRoco, datos.nombre);

      expect(zona.id).toBeNull();
      expect(zona.idRoco).toBe(1);
      expect(zona.nombre).toBe('Zona Norte');
    });

    it('debería crear una zona con ID numérico', () => {
      const zona = new Zona(10, 5, 'Zona Boulder');
      expect(zona.id).toBe(10);
      expect(zona.idRoco).toBe(5);
      expect(zona.nombre).toBe('Zona Boulder');
    });
  });

  describe('Validaciones', () => {
    it('debería lanzar error si idRoco no es un entero', () => {
      expect(() => new Zona(null, 'no-id', 'Zona A')).toThrow(
        'idRoco inválido: Debe ser un número entero.'
      );
    });

    it('debería lanzar error si nombre no es string', () => {
      expect(() => new Zona(null, 1, 123)).toThrow(
        'nombre inválido: Debe ser una cadena no vacía.'
      );
    });

    it('debería lanzar error si nombre es una cadena vacía', () => {
      expect(() => new Zona(null, 1, '')).toThrow(
        'nombre inválido: Debe ser una cadena no vacía.'
      );
    });

    it('debería lanzar error si nombre son solo espacios', () => {
      expect(() => new Zona(null, 1, '   ')).toThrow(
        'nombre inválido: Debe ser una cadena no vacía.'
      );
    });
  });
});
