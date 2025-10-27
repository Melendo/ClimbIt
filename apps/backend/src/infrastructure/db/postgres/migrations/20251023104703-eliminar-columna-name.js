'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Eliminar la columna 'name' de la tabla
    // Reemplaza 'nombre_de_la_tabla' por el nombre real de tu tabla
    await queryInterface.removeColumn('Pistas', 'name');
  },

  async down(queryInterface, Sequelize) {
    // Si necesitamos revertir, volvemos a añadir la columna con sus propiedades originales
    await queryInterface.addColumn('Pistas', 'name', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
