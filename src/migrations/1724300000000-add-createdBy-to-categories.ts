import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCreatedByToCategories1724300000000 implements MigrationInterface {
  name = 'AddCreatedByToCategories1724300000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "categories" ADD "createdById" integer`);
    await queryRunner.query(
      `ALTER TABLE "categories" ADD CONSTRAINT "FK_categories_createdBy_users" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "FK_categories_createdBy_users"`);
    await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "createdById"`);
  }
}

