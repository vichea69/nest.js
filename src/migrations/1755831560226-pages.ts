import { MigrationInterface, QueryRunner } from "typeorm";

export class Pages1755831560226 implements MigrationInterface {
    name = 'Pages1755831560226'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."pages_status_enum" AS ENUM('draft', 'published')`);
        await queryRunner.query(`CREATE TABLE "pages" ("id" SERIAL NOT NULL, "title" character varying(200) NOT NULL, "slug" character varying(240) NOT NULL, "content" text NOT NULL, "excerpt" character varying(500) DEFAULT '', "status" "public"."pages_status_enum" NOT NULL DEFAULT 'draft', "publishedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "authorId" integer, CONSTRAINT "UQ_fe66ca6a86dc94233e5d7789535" UNIQUE ("slug"), CONSTRAINT "PK_8f21ed625aa34c8391d636b7d3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "pages" ADD CONSTRAINT "FK_d2e423882ed3b21d37f9cb1ca7f" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pages" DROP CONSTRAINT "FK_d2e423882ed3b21d37f9cb1ca7f"`);
        await queryRunner.query(`DROP TABLE "pages"`);
        await queryRunner.query(`DROP TYPE "public"."pages_status_enum"`);
    }

}
