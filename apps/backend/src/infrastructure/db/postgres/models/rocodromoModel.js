'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Rocodromo extends Model {
    static associate(models) {
      Rocodromo.hasMany(models.Zona, {
        foreignKey: 'idRoco',
        as: 'zonas',
      });
      Rocodromo.belongsToMany(models.Escalador, {
        through: models.Suscripcion,
        foreignKey: 'idRocodromo',
        as: 'escaladores',
      });
    }
  }
  Rocodromo.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        field: 'IDRoco',
      },
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'Nombre',
      },
      ubicacion: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: 'Ubicacion',
      },
      mapa: {
        type: DataTypes.STRING, // Assuming URL or path to image
        allowNull: true,
        field: 'Mapa',
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
      modelName: 'Rocodromo',
      tableName: 'Rocodromos',
    }
  );
  return Rocodromo;
};
