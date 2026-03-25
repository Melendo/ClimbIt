'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.sequelize.query(
        "ALTER TYPE \"enum_Pistas_Tipo\" RENAME VALUE 'bloque' TO 'boulder';",
        { transaction }
      );

      await queryInterface.sequelize.query(
        'UPDATE "Pistas" SET "Tipo" = \'boulder\' WHERE "Tipo" IS NULL;',
        { transaction }
      );

      await queryInterface.changeColumn(
        'Pistas',
        'Tipo',
        {
          // eslint-disable-next-line new-cap
          type: Sequelize.ENUM('boulder', 'via'),
          allowNull: false,
        },
        { transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.sequelize.query(
        "ALTER TYPE \"enum_Pistas_Tipo\" RENAME VALUE 'boulder' TO 'bloque';",
        { transaction }
      );

      await queryInterface.changeColumn(
        'Pistas',
        'Tipo',
        {
          // eslint-disable-next-line new-cap
          type: Sequelize.ENUM('bloque', 'via'),
          allowNull: true,
        },
        { transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
