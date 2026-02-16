'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class EscalaPista extends Model {
    static associate(models) {
      // Associations are defined in Pista and Escalador
    }
  }
  EscalaPista.init(
    {
      idPista: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        field: 'IDPista',
        references: {
          model: 'Pistas',
          key: 'IDPista',
        },
      },
      idEscalador: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        field: 'IDEscalador',
        references: {
          model: 'Escaladores',
          key: 'IDEscalador',
        },
      },
      estado: {
        // eslint-disable-next-line new-cap
        type: DataTypes.ENUM('flash', 'completado', 'proyecto'),
        allowNull: false,
        field: 'Estado',
      },
    },
    {
      sequelize,
      modelName: 'EscalaPista',
      tableName: 'EscalaPista',
      timestamps: false,
    }
  );
  return EscalaPista;
};
