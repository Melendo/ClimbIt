import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import tokenService from '../../../../src/infrastructure/security/tokenService.js';

describe('Infrastructure: TokenService', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('crear', () => {
        it('debería firmar el token con el secreto y expiración por defecto', () => {
            const signSpy = jest.spyOn(jwt, 'sign').mockReturnValue('token_firmado');
            const payload = { id: 1 };

            const token = tokenService.crear(payload);

            expect(signSpy).toHaveBeenCalledWith(
                payload, 
                expect.any(String), // el secreto (env o default)
                expect.objectContaining({ expiresIn: expect.any(String) }) // opciones
            );
            expect(token).toBe('token_firmado');
        });
    });

    describe('verificar', () => {
        it('debería verificar el token usando el secreto', () => {
            const verifySpy = jest.spyOn(jwt, 'verify').mockReturnValue({ id: 1 });
            const token = 'token_firmado';

            const decoded = tokenService.verificar(token);

            expect(verifySpy).toHaveBeenCalledWith(token, expect.any(String));
            expect(decoded).toEqual({ id: 1 });
        });

        it('debería lanzar error si el token es inválido', () => {
            jest.spyOn(jwt, 'verify').mockImplementation(() => {
                throw new Error('invalid token');
            });

            expect(() => tokenService.verificar('bad_token')).toThrow('invalid token');
        });
    });
});
