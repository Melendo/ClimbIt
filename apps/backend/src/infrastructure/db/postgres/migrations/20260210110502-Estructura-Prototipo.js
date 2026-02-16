'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // 1. Create Rocodromos table
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
        unique: true,
      },
      Mapa: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      Activo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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

    // 2. Create Escaladores table
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
        unique: true,
      },
      Activo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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

    // 3. Create Zonas table
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
      Activo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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

    // 4. Create Pistas table
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
        allowNull: true,
      },
      Dificultad: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      Activo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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

    // 5. Create EscalaPista table (Join table)
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
        // eslint-disable-next-line new-cap
        type: Sequelize.ENUM('flash', 'completado', 'proyecto'),
        allowNull: false,
      },
    });

    // 6. Create Suscripciones table (Join table)
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

  async down(queryInterface, Sequelize) {
    // Drop tables in reverse order
    await queryInterface.dropTable('Suscripciones');
    await queryInterface.dropTable('EscalaPista');
    await queryInterface.dropTable('Pistas');
    await queryInterface.dropTable('Zonas');
    await queryInterface.dropTable('Escaladores');
    await queryInterface.dropTable('Rocodromos');

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_escala_pista_estado";'
    );
  },
};
