'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Escalador extends Model {}

  Escalador.init(
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
      edad: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      experiencia: {
        /* eslint-disable new-cap */
        type: DataTypes.ENUM(
          'Principiante',
          'Intermedio',
          'Avanzado',
          'Experto'
        ),
        /* eslint-enable new-cap */
        allowNull: true,
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
