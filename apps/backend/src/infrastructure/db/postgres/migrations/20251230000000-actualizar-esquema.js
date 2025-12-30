'use strict';

export default {
  up: async (queryInterface, Sequelize) => {
    // Limpiar datos existentes para evitar conflictos de esquema y restricciones únicas
    await queryInterface.bulkDelete('Escaladores', null, { truncate: true, cascade: true });
    await queryInterface.bulkDelete('Pistas', null, { truncate: true, cascade: true });

    // 1. Crear tabla Rocodromos
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
      Ubicación: {
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

    // 2. Crear tabla Zonas
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

    // 3. Modificar tabla Escaladores
    // Renombrar id -> IDEscalador
    await queryInterface.renameColumn('Escaladores', 'id', 'IDEscalador');
    
    // Eliminar columnas antiguas
    await queryInterface.removeColumn('Escaladores', 'nombre');
    await queryInterface.removeColumn('Escaladores', 'edad');
    await queryInterface.removeColumn('Escaladores', 'experiencia');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Escaladores_experiencia";');

    // Añadir nuevas columnas
    await queryInterface.addColumn('Escaladores', 'Correo', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    });

    await queryInterface.addColumn('Escaladores', 'Contraseña', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.addColumn('Escaladores', 'Apodo', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    // 4. Modificar tabla Pistas
    // Renombrar id -> IDPista
    await queryInterface.renameColumn('Pistas', 'id', 'IDPista');
    
    // Renombrar nombre -> Nombre
    await queryInterface.renameColumn('Pistas', 'nombre', 'Nombre');
    
    // Renombrar dificultad -> Dificultad
    await queryInterface.renameColumn('Pistas', 'dificultad', 'Dificultad');

    // Añadir IDZona FK
    await queryInterface.addColumn('Pistas', 'IDZona', {
      type: Sequelize.INTEGER,
      allowNull: false, // Ahora podemos poner false porque la tabla está vacía
      references: {
        model: 'Zonas',
        key: 'IDZona',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    // 5. Crear tabla Suscripciones
    await queryInterface.createTable('Suscripciones', {
      IDRocódromo: {
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

    // 6. Crear tabla EscalaPista
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
  },

  down: async (queryInterface, Sequelize) => {
    // Revertir cambios (simplificado)
    await queryInterface.dropTable('EscalaPista');
    await queryInterface.dropTable('Suscripciones');
    await queryInterface.removeColumn('Pistas', 'IDZona');
    await queryInterface.renameColumn('Pistas', 'IDPista', 'id');
    await queryInterface.renameColumn('Pistas', 'Nombre', 'nombre');
    await queryInterface.renameColumn('Pistas', 'Dificultad', 'dificultad');
    
    // Para Escaladores, sería complejo restaurar los datos perdidos, así que solo revertimos estructura básica
    await queryInterface.removeColumn('Escaladores', 'Correo');
    await queryInterface.removeColumn('Escaladores', 'Contraseña');
    await queryInterface.removeColumn('Escaladores', 'Apodo');
    await queryInterface.renameColumn('Escaladores', 'IDEscalador', 'id');
    await queryInterface.addColumn('Escaladores', 'nombre', { type: Sequelize.STRING });
    await queryInterface.addColumn('Escaladores', 'edad', { type: Sequelize.INTEGER });
    await queryInterface.addColumn('Escaladores', 'experiencia', {
      // eslint-disable-next-line new-cap
      type: Sequelize.ENUM(
        'Principiante',
        'Intermedio',
        'Avanzado',
        'Experto'
      ),
      allowNull: true,
    });
    
    await queryInterface.dropTable('Zonas');
    await queryInterface.dropTable('Rocodromos');
  }
};
