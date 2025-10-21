'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'escaladores',
      [
        {
          nombre: 'John Doe',
          edad: 15,
          experiencia: 'Intermedio',
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      'escaladores',
      {
        nombre: 'John Doe',
      },
      {}
    );
  },
};
