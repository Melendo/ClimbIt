'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('EscalasDificultad', 'IDRoco');
    await queryInterface.renameColumn(
      'EscalasDificultad',
      'Colores',
      'Dificultades'
    );
    await queryInterface.addColumn('EscalasDificultad', 'IsColor', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.addColumn('Rocodromos', 'DificultadBloque', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'EscalasDificultad',
        key: 'IDEscala',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
    await queryInterface.addColumn('Rocodromos', 'DificultadVia', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'EscalasDificultad',
        key: 'IDEscala',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Rocodromos', 'DificultadVia');
    await queryInterface.removeColumn('Rocodromos', 'DificultadBloque');

    await queryInterface.removeColumn('EscalasDificultad', 'IsColor');
    await queryInterface.renameColumn(
      'EscalasDificultad',
      'Dificultades',
      'Colores'
    );
    await queryInterface.addColumn('EscalasDificultad', 'IDRoco', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Rocodromos',
        key: 'IDRoco',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  },
};
