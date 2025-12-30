'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Suscripcion extends Model {
    static associate(models) {
      // Associations are defined in Rocodromo and Escalador
    }
  }
  Suscripcion.init(
    {
      idRocodromo: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        field: 'IDRocodromo',
        references: {
          model: 'Rocodromos',
          key: 'IDRoco',
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
    },
    {
      sequelize,
      modelName: 'Suscripcion',
      tableName: 'Suscripciones',
      timestamps: false,
    }
  );
  return Suscripcion;
};
