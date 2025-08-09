import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedCreatedAtForTags1754623504533 implements MigrationInterface {
    name = 'AddedCreatedAtForTags1754623504533'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tags" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tags" DROP COLUMN "createdAt"`);
    }

}
