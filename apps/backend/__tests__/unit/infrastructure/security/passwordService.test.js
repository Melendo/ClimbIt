import { jest } from '@jest/globals';
import bcrypt from 'bcrypt';
import passwordService from '../../../../src/infrastructure/security/passwordService.js';

describe('Infrastructure: PasswordService', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('hash', () => {
        it('debería llamar a bcrypt.hash con la contraseña y salt', async () => {
            const hashSpy = jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed_secret');
            const password = 'myPassword123';

            const result = await passwordService.hash(password);

            expect(hashSpy).toHaveBeenCalledWith(password, 10);
            expect(result).toBe('hashed_secret');
        });
    });

    describe('compare', () => {
        it('debería llamar a bcrypt.compare con la contraseña y el hash', async () => {
            const compareSpy = jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
            const password = 'myPassword123';
            const hash = 'hashed_secret';

            const result = await passwordService.compare(password, hash);

            expect(compareSpy).toHaveBeenCalledWith(password, hash);
            expect(result).toBe(true);
        });

        it('debería devolver false si las contraseñas no coinciden', async () => {
            jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);
            const result = await passwordService.compare('wrong', 'hash');
            expect(result).toBe(false);
        });
    });
});
