import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddLastLoginToUsers1724300100000 implements MigrationInterface {
  name = 'AddLastLoginToUsers1724300100000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('users');
    if (!table) {
      throw new Error('Table "users" not found');
    }

    if (!table.findColumnByName('lastLogin')) {
      await queryRunner.addColumn(
        'users',
        new TableColumn({
          name: 'lastLogin',
          type: 'timestamp',
          isNullable: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('users');
    if (!table) {
      return;
    }

    const column = table.findColumnByName('lastLogin');
    if (column) {
      await queryRunner.dropColumn('users', column);
    }
  }
}
