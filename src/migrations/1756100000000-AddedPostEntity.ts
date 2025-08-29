import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedPostEntity1756100000000 implements MigrationInterface {
  name = 'AddedPostEntity1756100000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "posts" (
        "id" SERIAL NOT NULL,
        "title" character varying(200) NOT NULL,
        "content" text DEFAULT '',
        "imageUrl" character varying(500),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "authorId" integer,
        CONSTRAINT "PK_posts_id" PRIMARY KEY ("id")
      )`
    );
    await queryRunner.query(
      `ALTER TABLE "posts"
        ADD CONSTRAINT "FK_posts_author_users" FOREIGN KEY ("authorId")
        REFERENCES "users"("id")
        ON DELETE SET NULL ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_posts_author_users"`);
    await queryRunner.query(`DROP TABLE "posts"`);
  }
}

