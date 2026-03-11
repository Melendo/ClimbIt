'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class GestorRocodromo extends Model {
    static associate(models) {
      // Definidas en Rocodromo y Escalador
    }
  }
  GestorRocodromo.init(
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
      propietario: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'Propietario',
      },
    },
    {
      sequelize,
      modelName: 'GestorRocodromo',
      tableName: 'GestorRocodromo',
      timestamps: false,
    }
  );
  return GestorRocodromo;
};
