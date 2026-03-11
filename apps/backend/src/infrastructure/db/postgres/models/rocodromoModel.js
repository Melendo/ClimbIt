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
      Rocodromo.hasMany(models.EscalaDificultad, {
        foreignKey: 'idRoco',
        as: 'escalasDificultad',
      });
      Rocodromo.belongsToMany(models.Escalador, {
        through: models.GestorRocodromo,
        foreignKey: 'idRocodromo',
        as: 'gestores',
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
      logoUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'LogoURL',
      },
      descripcion: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'Descripcion',
      },
      horarios: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'Horarios',
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
