'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'Escaladores',
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
      'Escaladores',
      {
        nombre: 'John Doe',
      },
      {}
    );
  },
};
