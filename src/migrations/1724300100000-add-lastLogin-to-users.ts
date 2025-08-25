import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLastLoginToUsers1724300100000 implements MigrationInterface {
  name = 'AddLastLoginToUsers1724300100000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "lastLogin" TIMESTAMP`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "lastLogin"`);
  }
}

