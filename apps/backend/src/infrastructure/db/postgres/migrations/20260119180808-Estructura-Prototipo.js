'use strict';

export default {
  up: async (queryInterface, Sequelize) => {
    // 1. Rocodromos
    await queryInterface.createTable('Rocodromos', {
      IDRoco: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      Nombre: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      Ubicacion: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      Mapa: {
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

    // 2. Escaladores
    await queryInterface.createTable('Escaladores', {
      IDEscalador: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      Correo: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      Contrasena: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      Apodo: {
        type: Sequelize.STRING,
        allowNull: false,
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

    // 3. Zonas
    await queryInterface.createTable('Zonas', {
      IDZona: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      IDRoco: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Rocodromos',
          key: 'IDRoco',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      Tipo: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      Mapa: {
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

    // 4. Pistas
    await queryInterface.createTable('Pistas', {
      IDPista: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      IDZona: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Zonas',
          key: 'IDZona',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      Nombre: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      Dificultad: {
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

    // 5. EscalaPista (Join table)
    await queryInterface.createTable('EscalaPista', {
      IDPista: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'Pistas',
          key: 'IDPista',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      IDEscalador: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'Escaladores',
          key: 'IDEscalador',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      Estado: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    });

    // 6. Suscripciones (Join table)
    await queryInterface.createTable('Suscripciones', {
      IDRocodromo: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'Rocodromos',
          key: 'IDRoco',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      IDEscalador: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'Escaladores',
          key: 'IDEscalador',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Suscripciones');
    await queryInterface.dropTable('EscalaPista');
    await queryInterface.dropTable('Pistas');
    await queryInterface.dropTable('Zonas');
    await queryInterface.dropTable('Escaladores');
    await queryInterface.dropTable('Rocodromos');
  },
};
