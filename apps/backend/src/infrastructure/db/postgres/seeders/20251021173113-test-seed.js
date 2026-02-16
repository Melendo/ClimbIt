'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'Escaladores',
      [
        {
          Correo: 'john@example.com',
          Contrasena: '123456',
          Apodo: 'JohnDoe',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      'Escaladores',
      {
        Correo: 'john@example.com',
      },
      {}
    );
  },
};
