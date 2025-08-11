import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedDefaultValueArticleDescription1754763398938 implements MigrationInterface {
    name = 'AddedDefaultValueArticleDescription1754763398938'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "articles" ALTER COLUMN "description" SET DEFAULT ''`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "articles" ALTER COLUMN "description" DROP DEFAULT`);
    }

}
