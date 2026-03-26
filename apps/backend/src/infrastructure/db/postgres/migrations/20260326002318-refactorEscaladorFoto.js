'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Escaladores', 'IDFotoPerfil', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'FotosPerfil',
        key: 'IDFotoPerfil',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.removeColumn('Escaladores', 'FotoURL');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn('Escaladores', 'FotoURL', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.removeColumn('Escaladores', 'IDFotoPerfil');
  }
};
