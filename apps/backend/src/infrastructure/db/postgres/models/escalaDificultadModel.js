'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class EscalaDificultad extends Model {
    static associate(models) {
      // No direct associations for now
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
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'Nombre',
      },
      dificultades: {
        // eslint-disable-next-line new-cap
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
        field: 'Dificultades',
      },
      isColor: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'IsColor',
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
