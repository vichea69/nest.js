import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterArticlesAuthorOnDeleteSetNull1757000000002 implements MigrationInterface {
    name = 'AlterArticlesAuthorOnDeleteSetNull1757000000002'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop old FK if exists
        await queryRunner.query(`
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.table_constraints 
                    WHERE constraint_name = 'FK_65d9ccc1b02f4d904e90bd76a34'
                ) THEN
                    ALTER TABLE "articles" DROP CONSTRAINT "FK_65d9ccc1b02f4d904e90bd76a34";
                END IF;
            END
            $$;
        `);

        // Make column nullable
        await queryRunner.query(`ALTER TABLE "articles" ALTER COLUMN "authorId" DROP NOT NULL`);

        // Create new FK with ON DELETE SET NULL
        await queryRunner.query(`
            ALTER TABLE "articles" 
            ADD CONSTRAINT "FK_articles_author_setnull" FOREIGN KEY ("authorId") 
            REFERENCES "users"("id") 
            ON DELETE SET NULL 
            ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop new FK
        await queryRunner.query(`
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.table_constraints 
                    WHERE constraint_name = 'FK_articles_author_setnull'
                ) THEN
                    ALTER TABLE "articles" DROP CONSTRAINT "FK_articles_author_setnull";
                END IF;
            END
            $$;
        `);

        // Make column NOT NULL again
        await queryRunner.query(`ALTER TABLE "articles" ALTER COLUMN "authorId" SET NOT NULL`);

        // Restore original FK
        await queryRunner.query(`
            ALTER TABLE "articles" 
            ADD CONSTRAINT "FK_65d9ccc1b02f4d904e90bd76a34" FOREIGN KEY ("authorId") 
            REFERENCES "users"("id") 
            ON DELETE NO ACTION 
            ON UPDATE NO ACTION
        `);
    }
}

