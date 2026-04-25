import { jest } from '@jest/globals';
import { Model } from 'sequelize';
import solicitudAmistadModelFactory from '../../../../../../src/infrastructure/db/postgres/models/solicitudAmistadModel.js';

describe('Infrastructure Model: SolicitudAmistad', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('inicializa el modelo con metadatos esperados', () => {
    const initSpy = jest.spyOn(Model, 'init').mockReturnValue();

    const DataTypes = {
      INTEGER: 'INTEGER',
      ENUM: (...values) => ({ values }),
    };

    const sequelize = {};
    const SolicitudAmistad = solicitudAmistadModelFactory(sequelize, DataTypes);

    expect(SolicitudAmistad.name).toBe('SolicitudAmistad');
    expect(initSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.objectContaining({ field: 'IDSolicitudAmistad' }),
        idRemitente: expect.objectContaining({ field: 'IDRemitente' }),
        idDestinatario: expect.objectContaining({ field: 'IDDestinatario' }),
        estado: expect.objectContaining({ field: 'Estado' }),
      }),
      expect.objectContaining({
        modelName: 'SolicitudAmistad',
        tableName: 'SolicitudesAmistad',
        timestamps: true,
      })
    );
  });

  it('define asociaciones belongsTo para remitente y destinatario', () => {
    jest.spyOn(Model, 'init').mockReturnValue();
    const DataTypes = {
      INTEGER: 'INTEGER',
      ENUM: (...values) => ({ values }),
    };

    const SolicitudAmistad = solicitudAmistadModelFactory({}, DataTypes);
    SolicitudAmistad.belongsTo = jest.fn();

    SolicitudAmistad.associate({ Escalador: {} });

    expect(SolicitudAmistad.belongsTo).toHaveBeenCalledTimes(2);
    expect(SolicitudAmistad.belongsTo).toHaveBeenNthCalledWith(
      1,
      {},
      expect.objectContaining({ foreignKey: 'idRemitente', as: 'remitente' })
    );
    expect(SolicitudAmistad.belongsTo).toHaveBeenNthCalledWith(
      2,
      {},
      expect.objectContaining({ foreignKey: 'idDestinatario', as: 'destinatario' })
    );
  });
});
