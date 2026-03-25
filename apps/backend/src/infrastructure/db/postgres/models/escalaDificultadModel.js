'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class EscalaDificultad extends Model {
    static associate(models) {
      EscalaDificultad.belongsTo(models.Rocodromo, {
        foreignKey: 'idRoco',
        as: 'rocodromo',
      });
    }
  }
  EscalaDificultad.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        field: 'IDEscala',
      },
      idRoco: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'IDRoco',
        references: {
          model: 'Rocodromos',
          key: 'IDRoco',
        },
      },
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'Nombre',
      },
      colores: {
        // eslint-disable-next-line new-cap
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
        field: 'Colores',
      },
      activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'Activo',
      },
    },
    {
      sequelize,
      modelName: 'EscalaDificultad',
      tableName: 'EscalasDificultad',
    }
  );
  return EscalaDificultad;
};
