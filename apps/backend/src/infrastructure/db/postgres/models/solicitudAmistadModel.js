'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class SolicitudAmistad extends Model {
    static associate(models) {
      SolicitudAmistad.belongsTo(models.Escalador, {
        foreignKey: 'idRemitente',
        as: 'remitente',
      });

      SolicitudAmistad.belongsTo(models.Escalador, {
        foreignKey: 'idDestinatario',
        as: 'destinatario',
      });
    }
  }

  SolicitudAmistad.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        field: 'IDSolicitudAmistad',
      },
      idRemitente: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'IDRemitente',
        references: {
          model: 'Escaladores',
          key: 'IDEscalador',
        },
      },
      idDestinatario: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'IDDestinatario',
        references: {
          model: 'Escaladores',
          key: 'IDEscalador',
        },
      },
      estado: {
        // eslint-disable-next-line new-cap
        type: DataTypes.ENUM('pendiente', 'aceptada', 'rechazada'),
        allowNull: false,
        defaultValue: 'pendiente',
        field: 'Estado',
      },
    },
    {
      sequelize,
      modelName: 'SolicitudAmistad',
      tableName: 'SolicitudesAmistad',
      timestamps: true,
    }
  );

  return SolicitudAmistad;
};