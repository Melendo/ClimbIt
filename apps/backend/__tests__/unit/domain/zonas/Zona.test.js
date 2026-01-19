import { describe, it, expect } from '@jest/globals';
import Zona from '../../../../src/domain/zonas/Zona.js';

describe('Zona (Entidad de dominio)', () => {
  describe('Creación exitosa', () => {
    it('debería crear una zona con los datos correctos', () => {
      const datos = { id: null, idRoco: 1, tipo: 'Zona Norte' };
      const zona = new Zona(datos.id, datos.idRoco, datos.tipo);

      expect(zona.id).toBeNull();
      expect(zona.idRoco).toBe(1);
      expect(zona.tipo).toBe('Zona Norte');
    });

    it('debería crear una zona con ID numérico', () => {
      const zona = new Zona(10, 5, 'Zona Boulder');
      expect(zona.id).toBe(10);
      expect(zona.idRoco).toBe(5);
      expect(zona.tipo).toBe('Zona Boulder');
    });
  });

  describe('Validaciones', () => {
    it('debería lanzar error si idRoco no es un entero', () => {
      expect(() => new Zona(null, 'no-id', 'Zona A')).toThrow(
        'idRoco inválido: Debe ser un número entero.'
      );
    });

    it('debería lanzar error si tipo no es string', () => {
      expect(() => new Zona(null, 1, 123)).toThrow(
        'tipo inválido: Debe ser una cadena no vacía.'
      );
    });

    it('debería lanzar error si tipo es una cadena vacía', () => {
      expect(() => new Zona(null, 1, '')).toThrow(
        'tipo inválido: Debe ser una cadena no vacía.'
      );
    });

    it('debería lanzar error si tipo son solo espacios', () => {
      expect(() => new Zona(null, 1, '   ')).toThrow(
        'tipo inválido: Debe ser una cadena no vacía.'
      );
    });
  });
});
