'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class FotosPerfil extends Model {}

  FotosPerfil.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        field: 'IDFotoPerfil',
      },
      urlFoto: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'URLFoto',
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
      modelName: 'FotosPerfil',
      tableName: 'FotosPerfil',
      timestamps: false,
    }
  );

  return FotosPerfil;
};
