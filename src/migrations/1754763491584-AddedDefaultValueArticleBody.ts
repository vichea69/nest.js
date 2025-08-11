import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedDefaultValueArticleBody1754763491584 implements MigrationInterface {
    name = 'AddedDefaultValueArticleBody1754763491584'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "articles" ALTER COLUMN "body" SET DEFAULT ''`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "articles" ALTER COLUMN "body" DROP DEFAULT`);
    }

}
