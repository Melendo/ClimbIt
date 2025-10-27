'use strict';

export default {
  up: async (queryInterface, Sequelize) => {
    // Crear tabla Escaladores
    await queryInterface.createTable('Escaladores', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      nombre: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      edad: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      experiencia: {
        // eslint-disable-next-line new-cap
        type: Sequelize.ENUM(
          'Principiante',
          'Intermedio',
          'Avanzado',
          'Experto'
        ),
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    // Crear tabla Pistas
    await queryInterface.createTable('Pistas', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      nombre: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      dificultad: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Eliminar tablas en orden inverso
    await queryInterface.dropTable('Pistas');
    await queryInterface.dropTable('Escaladores');

    // En PostgreSQL hay que eliminar el tipo ENUM creado por Sequelize
    // Nombre generado por Sequelize: enum_<Table>_<column>
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_Escaladores_experiencia";'
    );
  },
};
