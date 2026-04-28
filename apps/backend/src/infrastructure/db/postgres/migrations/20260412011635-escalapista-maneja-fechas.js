'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('EscalaPista', 'FechaCompletado', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null,
    });

    const [columns] = await queryInterface.sequelize.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'EscalaPista'
        AND column_name IN ('createdAt', 'FechaCreacion')
    `);

    const sourceColumn =
      Array.isArray(columns) && columns.length > 0
        ? columns[0].column_name
        : null;

    const sourceExpr = sourceColumn ? `"${sourceColumn}"` : 'NOW()';

    await queryInterface.sequelize.query(`
      UPDATE "EscalaPista"
      SET "FechaCompletado" = COALESCE(${sourceExpr}, NOW())
      WHERE "Estado" IN ('flash', 'completado')
        AND "FechaCompletado" IS NULL
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('EscalaPista', 'FechaCompletado');
  },
};
