jest.mock('../../../src/infrastructure/db/postgres', () => ({
    query: jest.fn(),
}));

const pool = require('../../../src/infrastructure/db/postgres');
const PistaRepositoryPostgres = require('../../../src/infrastructure/repositories/PistaRepositoryPostgres');

describe('PistaRepositoryPostgres', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('debería guardar una pista llamando a la base de datos', async () => {
        const pista = { nombre: 'El Muro', dificultad: '6a' };
        const fakeResult = { rows: [{ id: 1, ...pista }] };

        pool.query.mockResolvedValue(fakeResult);

        const resultado = await PistaRepositoryPostgres.guardar(pista);

        expect(resultado).toEqual({ id: 1, ...pista });
    });
});
