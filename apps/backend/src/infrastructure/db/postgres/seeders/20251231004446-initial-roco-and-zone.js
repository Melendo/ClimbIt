'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Rocodromos', [{
      Nombre: 'Rocódromo Central',
      Ubicacion: 'Calle Principal 123, Madrid',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);

    const rocodromos = await queryInterface.sequelize.query(
      `SELECT "IDRoco" from "Rocodromos" WHERE "Nombre" = 'Rocódromo Central';`
    );

    const rocoId = rocodromos[0][0].IDRoco;

    await queryInterface.bulkInsert('Zonas', [{
      IDRoco: rocoId,
      Tipo: 'Bloque',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Rocodromos', { Nombre: 'Rocódromo Central' }, {});
  }
};
