'use strict';
// Migración vacía para establecer una línea base inicial del esquema de la base de datos
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.resolve();
  },

  async down(queryInterface, Sequelize) {
    return Promise.resolve();
  },
};
