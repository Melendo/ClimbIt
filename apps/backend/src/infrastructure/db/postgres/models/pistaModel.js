'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Pista extends Model {
    static associate(models) {
      Pista.belongsTo(models.Zona, {
        foreignKey: 'idZona',
        as: 'zona',
      });
      Pista.belongsToMany(models.Escalador, {
        through: models.EscalaPista,
        foreignKey: 'idPista',
        as: 'escaladores',
      });
    }
  }
  Pista.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        field: 'IDPista',
      },
      idZona: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'IDZona',
        references: {
          model: 'Zonas',
          key: 'IDZona',
        },
      },
      nombre: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'Nombre',
      },
      dificultad: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'Dificultad',
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
      modelName: 'Pista',
      tableName: 'Pistas',
    }
  );
  return Pista;
};
