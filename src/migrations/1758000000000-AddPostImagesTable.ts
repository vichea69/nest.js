import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPostImagesTable1758000000000 implements MigrationInterface {
  name = 'AddPostImagesTable1758000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "post_images" (
        "id" SERIAL NOT NULL,
        "url" character varying(500) NOT NULL,
        "sortOrder" integer NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "postId" integer NOT NULL,
        CONSTRAINT "PK_post_images_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "post_images"
        ADD CONSTRAINT "FK_post_images_posts" FOREIGN KEY ("postId")
        REFERENCES "posts"("id")
        ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      INSERT INTO "post_images" ("url", "sortOrder", "postId")
      SELECT "imageUrl", 0, "id"
      FROM "posts"
      WHERE "imageUrl" IS NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "posts" DROP COLUMN "imageUrl"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "posts" ADD "imageUrl" character varying(500)
    `);

    await queryRunner.query(`
      UPDATE "posts" p
      SET "imageUrl" = sub."url"
      FROM (
        SELECT DISTINCT ON ("postId") "postId", "url"
        FROM "post_images"
        ORDER BY "postId", "sortOrder", "id"
      ) AS sub
      WHERE sub."postId" = p."id"
    `);

    await queryRunner.query(`
      ALTER TABLE "post_images" DROP CONSTRAINT "FK_post_images_posts"
    `);

    await queryRunner.query(`
      DROP TABLE "post_images"
    `);
  }
}
