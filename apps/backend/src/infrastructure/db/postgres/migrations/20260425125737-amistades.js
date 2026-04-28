'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('SolicitudesAmistad', {
      IDSolicitudAmistad: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      IDRemitente: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Escaladores',
          key: 'IDEscalador',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      IDDestinatario: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Escaladores',
          key: 'IDEscalador',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      Estado: {
        // eslint-disable-next-line new-cap
        type: Sequelize.ENUM('pendiente', 'aceptada', 'rechazada'),
        allowNull: false,
        defaultValue: 'pendiente',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    await queryInterface.addIndex(
      'SolicitudesAmistad',
      ['IDRemitente', 'IDDestinatario'],
      {
        unique: true,
        name: 'solicitudes_amistad_remitente_destinatario_unique',
      }
    );

    await queryInterface.sequelize.query(
      'ALTER TABLE "SolicitudesAmistad" ADD CONSTRAINT "solicitudes_amistad_remitente_distinto_destinatario_check" CHECK ("IDRemitente" <> "IDDestinatario");'
    );

    await queryInterface.createTable('Amistades', {
      IDAmistad: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      IDEscalador1: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Escaladores',
          key: 'IDEscalador',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      IDEscalador2: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Escaladores',
          key: 'IDEscalador',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      FechaInicio: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    await queryInterface.addIndex(
      'Amistades',
      ['IDEscalador1', 'IDEscalador2'],
      {
        unique: true,
        name: 'amistades_escalador1_escalador2_unique',
      }
    );

    await queryInterface.sequelize.query(
      'ALTER TABLE "Amistades" ADD CONSTRAINT "amistades_escalador1_menor_que_escalador2_check" CHECK ("IDEscalador1" < "IDEscalador2");'
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      'ALTER TABLE "Amistades" DROP CONSTRAINT IF EXISTS "amistades_escalador1_menor_que_escalador2_check";'
    );
    await queryInterface.removeIndex(
      'Amistades',
      'amistades_escalador1_escalador2_unique'
    );
    await queryInterface.dropTable('Amistades');

    await queryInterface.sequelize.query(
      'ALTER TABLE "SolicitudesAmistad" DROP CONSTRAINT IF EXISTS "solicitudes_amistad_remitente_distinto_destinatario_check";'
    );
    await queryInterface.removeIndex(
      'SolicitudesAmistad',
      'solicitudes_amistad_remitente_destinatario_unique'
    );
    await queryInterface.dropTable('SolicitudesAmistad');

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_SolicitudesAmistad_Estado";'
    );
  },
};
