import { describe, it, expect } from '@jest/globals';
import Rocodromo from '../../../../src/domain/rocodromos/Rocodromo.js';

describe('Rocodromo (Entidad de dominio)', () => {
  describe('Creación exitosa', () => {
    it('debería crear un rocódromo con los datos correctos', () => {
      const datos = { id: null, nombre: 'Rocódromo Central', ubicacion: 'Madrid' };
      const rocodromo = new Rocodromo(datos.id, datos.nombre, datos.ubicacion);

      expect(rocodromo.id).toBeNull();
      expect(rocodromo.nombre).toBe('Rocódromo Central');
      expect(rocodromo.ubicacion).toBe('Madrid');
    });

    it('debería crear un rocódromo con ID numérico', () => {
      const rocodromo = new Rocodromo(10, 'Rocódromo Norte', 'Barcelona');
      expect(rocodromo.id).toBe(10);
      expect(rocodromo.nombre).toBe('Rocódromo Norte');
      expect(rocodromo.ubicacion).toBe('Barcelona');
    });
  });

  describe('Validaciones', () => {
    it('debería lanzar error si id no es un número o null', () => {
      expect(() => new Rocodromo('abc', 'Nombre', 'Ubicación')).toThrow(
        'id inválido: Debe ser un número o null.'
      );
    });

    it('debería lanzar error si nombre no es string', () => {
      expect(() => new Rocodromo(1, 123, 'Ubicación')).toThrow(
        'nombre inválido: Debe ser una cadena no vacía.'
      );
    });

    it('debería lanzar error si nombre es una cadena vacía', () => {
      expect(() => new Rocodromo(1, '', 'Ubicación')).toThrow(
        'nombre inválido: Debe ser una cadena no vacía.'
      );
    });
    
    it('debería lanzar error si nombre son solo espacios', () => {
      expect(() => new Rocodromo(1, '   ', 'Ubicación')).toThrow(
        'nombre inválido: Debe ser una cadena no vacía.'
      );
    });

    it('debería lanzar error si ubicacion no es string', () => {
      expect(() => new Rocodromo(1, 'Nombre', 123)).toThrow(
        'ubicacion inválida: Debe ser una cadena no vacía.'
      );
    });

    it('debería lanzar error si ubicacion es una cadena vacía', () => {
      expect(() => new Rocodromo(1, 'Nombre', '')).toThrow(
        'ubicacion inválida: Debe ser una cadena no vacía.'
      );
    });
  });
});
