'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Escalador extends Model {
    static associate(models) {
      Escalador.belongsToMany(models.Rocodromo, {
        through: models.Suscripcion,
        foreignKey: 'idEscalador',
        as: 'rocodromos',
      });
      Escalador.belongsToMany(models.Pista, {
        through: models.EscalaPista,
        foreignKey: 'idEscalador',
        as: 'pistasEscaladas',
      });
      Escalador.belongsToMany(models.Rocodromo, {
        through: models.GestorRocodromo,
        foreignKey: 'idEscalador',
        as: 'rocodromosGestionados',
      });
    }
  }

  Escalador.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        field: 'IDEscalador',
      },
      correo: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: 'Correo',
      },
      contrasena: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'Contrasena',
      },
      apodo: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: 'Apodo',
      },
      descripcion: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'Descripcion',
      },
      idFotoPerfil: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'IDFotoPerfil',
      },
      activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'Activo',
      },
      isAdmin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'IsAdmin',
      },
    },
    {
      sequelize,
      modelName: 'Escalador',
      tableName: 'Escaladores',
    }
  );
  return Escalador;
};
