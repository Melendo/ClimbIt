'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // 1. Alter Rocodromos: remove Mapa, add LogoURL, Descripcion, Horarios
    await queryInterface.removeColumn('Rocodromos', 'Mapa');
    await queryInterface.addColumn('Rocodromos', 'LogoURL', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Rocodromos', 'Descripcion', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Rocodromos', 'Horarios', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // 2. Alter Escaladores: add Descripcion, FotoURL
    await queryInterface.addColumn('Escaladores', 'Descripcion', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Escaladores', 'FotoURL', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // 3. Alter Zonas: rename column Tipo → Nombre
    await queryInterface.renameColumn('Zonas', 'Tipo', 'Nombre');

    // 4. Alter Pistas: remove createdAt, add Tipo (ENUM), ColorPresas, ImagenURL, UbicacionMapa, FechaCreacion, FechaRetirada
    await queryInterface.removeColumn('Pistas', 'createdAt');
    await queryInterface.addColumn('Pistas', 'Tipo', {
      // eslint-disable-next-line new-cap
      type: Sequelize.ENUM('bloque', 'via'),
      allowNull: true,
    });
    await queryInterface.addColumn('Pistas', 'ColorPresas', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Pistas', 'ImagenURL', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Pistas', 'UbicacionMapa', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Pistas', 'FechaCreacion', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('Pistas', 'FechaRetirada', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    // 5. Create GestorRocodromo table
    await queryInterface.createTable('GestorRocodromo', {
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
      Propietario: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    });

    // 6. Create EscalasDificultad table
    await queryInterface.createTable('EscalasDificultad', {
      IDEscala: {
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
      Nombre: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      Colores: {
        // eslint-disable-next-line new-cap
        type: Sequelize.ARRAY(Sequelize.STRING),
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
  },

  async down(queryInterface, Sequelize) {
    // Reverse order

    // 6. Drop EscalasDificultad
    await queryInterface.dropTable('EscalasDificultad');

    // 5. Drop GestorRocodromo
    await queryInterface.dropTable('GestorRocodromo');

    // 4. Revert Pistas columns
    await queryInterface.addColumn('Pistas', 'createdAt', {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()'),
    });
    await queryInterface.removeColumn('Pistas', 'FechaRetirada');
    await queryInterface.removeColumn('Pistas', 'FechaCreacion');
    await queryInterface.removeColumn('Pistas', 'UbicacionMapa');
    await queryInterface.removeColumn('Pistas', 'ImagenURL');
    await queryInterface.removeColumn('Pistas', 'ColorPresas');
    await queryInterface.removeColumn('Pistas', 'Tipo');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_Pistas_Tipo";'
    );

    // 3. Revert Zonas: rename Nombre → Tipo
    await queryInterface.renameColumn('Zonas', 'Nombre', 'Tipo');

    // 2. Revert Escaladores columns
    await queryInterface.removeColumn('Escaladores', 'FotoURL');
    await queryInterface.removeColumn('Escaladores', 'Descripcion');

    // 1. Revert Rocodromos: remove added columns, restore Mapa
    await queryInterface.removeColumn('Rocodromos', 'Horarios');
    await queryInterface.removeColumn('Rocodromos', 'Descripcion');
    await queryInterface.removeColumn('Rocodromos', 'LogoURL');
    await queryInterface.addColumn('Rocodromos', 'Mapa', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
