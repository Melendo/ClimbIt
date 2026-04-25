import { jest } from '@jest/globals';
import { Model } from 'sequelize';
import amistadModelFactory from '../../../../../../src/infrastructure/db/postgres/models/amistadModel.js';

describe('Infrastructure Model: Amistad', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('inicializa el modelo con metadatos esperados', () => {
    const initSpy = jest.spyOn(Model, 'init').mockReturnValue();

    const DataTypes = {
      INTEGER: 'INTEGER',
      DATE: 'DATE',
      NOW: 'NOW',
    };

    const sequelize = {};
    const Amistad = amistadModelFactory(sequelize, DataTypes);

    expect(Amistad.name).toBe('Amistad');
    expect(initSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.objectContaining({ field: 'IDAmistad' }),
        idEscalador1: expect.objectContaining({ field: 'IDEscalador1' }),
        idEscalador2: expect.objectContaining({ field: 'IDEscalador2' }),
      }),
      expect.objectContaining({
        modelName: 'Amistad',
        tableName: 'Amistades',
        timestamps: true,
      })
    );
  });

  it('define asociaciones belongsTo con Escalador', () => {
    const initSpy = jest.spyOn(Model, 'init').mockReturnValue();
    const DataTypes = {
      INTEGER: 'INTEGER',
      DATE: 'DATE',
      NOW: 'NOW',
    };
    const Amistad = amistadModelFactory({}, DataTypes);
    Amistad.belongsTo = jest.fn();

    Amistad.associate({ Escalador: {} });

    expect(initSpy).toHaveBeenCalled();
    expect(Amistad.belongsTo).toHaveBeenCalledTimes(2);
    expect(Amistad.belongsTo).toHaveBeenNthCalledWith(
      1,
      {},
      expect.objectContaining({ foreignKey: 'idEscalador1', as: 'escalador1' })
    );
    expect(Amistad.belongsTo).toHaveBeenNthCalledWith(
      2,
      {},
      expect.objectContaining({ foreignKey: 'idEscalador2', as: 'escalador2' })
    );
  });
});
