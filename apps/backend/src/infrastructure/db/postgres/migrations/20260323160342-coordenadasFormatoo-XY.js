'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Pistas', 'UbicacionMapa');
    await queryInterface.addColumn('Pistas', 'PosX', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('Pistas', 'PosY', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Pistas', 'PosY');
    await queryInterface.removeColumn('Pistas', 'PosX');
    await queryInterface.addColumn('Pistas', 'UbicacionMapa', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  }
};
