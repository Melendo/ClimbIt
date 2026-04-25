'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Amistad extends Model {
    static associate(models) {
      Amistad.belongsTo(models.Escalador, {
        foreignKey: 'idEscalador1',
        as: 'escalador1',
      });

      Amistad.belongsTo(models.Escalador, {
        foreignKey: 'idEscalador2',
        as: 'escalador2',
      });
    }
  }

  Amistad.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        field: 'IDAmistad',
      },
      idEscalador1: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'IDEscalador1',
        references: {
          model: 'Escaladores',
          key: 'IDEscalador',
        },
      },
      idEscalador2: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'IDEscalador2',
        references: {
          model: 'Escaladores',
          key: 'IDEscalador',
        },
      },
      fechaInicio: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'FechaInicio',
      },
    },
    {
      sequelize,
      modelName: 'Amistad',
      tableName: 'Amistades',
      timestamps: true,
    }
  );

  return Amistad;
};