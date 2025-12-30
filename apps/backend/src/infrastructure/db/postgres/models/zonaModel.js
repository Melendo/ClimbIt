'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Zona extends Model {
    static associate(models) {
      Zona.belongsTo(models.Rocodromo, {
        foreignKey: 'idRoco',
        as: 'rocodromo',
      });
      Zona.hasMany(models.Pista, {
        foreignKey: 'idZona',
        as: 'pistas',
      });
    }
  }
  Zona.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        field: 'IDZona',
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
      tipo: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'Tipo',
      },
      mapa: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'Mapa',
      },
    },
    {
      sequelize,
      modelName: 'Zona',
      tableName: 'Zonas',
    }
  );
  return Zona;
};
