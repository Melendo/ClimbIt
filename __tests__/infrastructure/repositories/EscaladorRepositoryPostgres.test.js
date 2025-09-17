jest.mock('../../../src/infrastructure/db/postgres', () => ({
    query: jest.fn(),
}));

const pool = require('../../../src/infrastructure/db/postgres');
const EscaladorRepositoryPostgres = require('../../../src/infrastructure/repositories/EscaladorRepositoryPostgres');

describe('EscaladorRepositoryPostgres', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('debería guardar un escalador llamando a la base de datos', async () => {
        const escalador = { nombre: 'Juan', edad: 30, experiencia: 'intermedio' };
        const fakeResult = { rows: [{ id: 1, ...escalador }] };

        pool.query.mockResolvedValue(fakeResult);

        const resultado = await EscaladorRepositoryPostgres.guardar(escalador);

        expect(resultado).toEqual({ id: 1, ...escalador });
    });
});