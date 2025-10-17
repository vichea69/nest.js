import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from "typeorm";

export class AddCreatedByToCategories1724300000000 implements MigrationInterface {
  name = 'AddCreatedByToCategories1724300000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('categories');
    if (!table) {
      throw new Error('Table "categories" not found');
    }

    const columnName = 'createdById';
    const fkName = 'FK_categories_createdBy_users';

    if (!table.findColumnByName(columnName)) {
      await queryRunner.addColumn(
        'categories',
        new TableColumn({
          name: columnName,
          type: 'integer',
          isNullable: true,
        })
      );
    }

    const hasForeignKey = table.foreignKeys.some((foreignKey) => foreignKey.name === fkName);
    if (!hasForeignKey) {
      await queryRunner.createForeignKey(
        'categories',
        new TableForeignKey({
          name: fkName,
          columnNames: [columnName],
          referencedTableName: 'users',
          referencedColumnNames: ['id'],
          onDelete: 'SET NULL',
          onUpdate: 'NO ACTION',
        })
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    let table = await queryRunner.getTable('categories');
    if (!table) {
      return;
    }

    const columnName = 'createdById';
    const fkName = 'FK_categories_createdBy_users';

    const foreignKey = table.foreignKeys.find((fk) => fk.name === fkName);
    if (foreignKey) {
      await queryRunner.dropForeignKey('categories', foreignKey);
    }

    table = await queryRunner.getTable('categories');
    const column = table?.findColumnByName(columnName);
    if (column) {
      await queryRunner.dropColumn('categories', column);
    }
  }
}
