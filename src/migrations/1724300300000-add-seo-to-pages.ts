import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSeoToPages1724300300000 implements MigrationInterface {
  name = 'AddSeoToPages1724300300000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add SEO columns if table exists
    await queryRunner.query(`ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "metaTitle" varchar(255)`);
    await queryRunner.query(`ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "metaDescription" varchar(500)`);
    await queryRunner.query(`ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "canonicalUrl" varchar(500)`);
    await queryRunner.query(`ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "ogImageUrl" varchar(500)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "pages" DROP COLUMN IF EXISTS "ogImageUrl"`);
    await queryRunner.query(`ALTER TABLE "pages" DROP COLUMN IF EXISTS "canonicalUrl"`);
    await queryRunner.query(`ALTER TABLE "pages" DROP COLUMN IF EXISTS "metaDescription"`);
    await queryRunner.query(`ALTER TABLE "pages" DROP COLUMN IF EXISTS "metaTitle"`);
  }
}

