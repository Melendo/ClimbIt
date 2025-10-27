'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Pista extends Model {}
  Pista.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      dificultad: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Pista',
      tableName: 'Pistas',
    }
  );
  return Pista;
};
