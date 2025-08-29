import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveFavoritesCountFromArticles1757000000001 implements MigrationInterface {
    name = 'RemoveFavoritesCountFromArticles1757000000001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "articles" DROP COLUMN IF EXISTS "favoritesCount"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "articles" ADD "favoritesCount" integer NOT NULL DEFAULT '0'`);
    }
}

