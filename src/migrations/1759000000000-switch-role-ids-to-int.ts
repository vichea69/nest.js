import { MigrationInterface, QueryRunner } from "typeorm";

export class SwitchRoleIdsToInt1759000000000 implements MigrationInterface {
    name = 'SwitchRoleIdsToInt1759000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        DO $$
        DECLARE
            constraint_name text;
        BEGIN
            FOR constraint_name IN
                SELECT conname
                FROM pg_constraint
                WHERE conrelid = 'role_permissions'::regclass
                  AND confrelid = 'roles'::regclass
                  AND contype = 'f'
            LOOP
                EXECUTE 'ALTER TABLE "role_permissions" DROP CONSTRAINT ' || quote_ident(constraint_name);
            END LOOP;
        END $$;
        `);

        await queryRunner.query(`
        DO $$
        DECLARE
            constraint_name text;
        BEGIN
            SELECT conname INTO constraint_name
            FROM pg_constraint
            WHERE conrelid = 'roles'::regclass
              AND contype = 'p'
            LIMIT 1;

            IF constraint_name IS NOT NULL THEN
                EXECUTE 'ALTER TABLE "roles" DROP CONSTRAINT ' || quote_ident(constraint_name);
            END IF;
        END $$;
        `);

        await queryRunner.query(`ALTER TABLE "roles" RENAME COLUMN "id" TO "id_uuid";`);
        await queryRunner.query(`CREATE SEQUENCE "roles_id_seq";`);
        await queryRunner.query(`ALTER TABLE "roles" ADD COLUMN "id" integer NOT NULL DEFAULT nextval('"roles_id_seq"');`);
        await queryRunner.query(`ALTER SEQUENCE "roles_id_seq" OWNED BY "roles"."id";`);
        await queryRunner.query(`ALTER TABLE "roles" ADD CONSTRAINT "PK_roles_id_int" PRIMARY KEY ("id");`);

        await queryRunner.query(`ALTER TABLE "role_permissions" ADD COLUMN "role_id_new" integer;`);
        await queryRunner.query(`
        UPDATE "role_permissions" rp
        SET "role_id_new" = r."id"
        FROM "roles" r
        WHERE rp."role_id" = r."id_uuid";
        `);
        await queryRunner.query(`ALTER TABLE "role_permissions" ALTER COLUMN "role_id_new" SET NOT NULL;`);
        await queryRunner.query(`ALTER TABLE "role_permissions" DROP COLUMN "role_id";`);
        await queryRunner.query(`ALTER TABLE "role_permissions" RENAME COLUMN "role_id_new" TO "role_id";`);
        await queryRunner.query(`
        ALTER TABLE "role_permissions"
        ADD CONSTRAINT "FK_role_permissions_role_id_roles_int"
        FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE;
        `);
        await queryRunner.query(`
        ALTER TABLE "role_permissions"
        ADD CONSTRAINT "UQ_role_permissions_role_id_resource_int" UNIQUE ("role_id", "resource");
        `);

        await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "id_uuid";`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_role_permissions_role_id_roles_int";`);

        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
        await queryRunner.query(`ALTER TABLE "roles" ADD COLUMN "id_uuid" uuid NOT NULL DEFAULT uuid_generate_v4();`);

        await queryRunner.query(`ALTER TABLE "role_permissions" ADD COLUMN "role_id_old" uuid;`);
        await queryRunner.query(`
        UPDATE "role_permissions" rp
        SET "role_id_old" = r."id_uuid"
        FROM "roles" r
        WHERE rp."role_id" = r."id";
        `);
        await queryRunner.query(`ALTER TABLE "role_permissions" ALTER COLUMN "role_id_old" SET NOT NULL;`);

        await queryRunner.query(`ALTER TABLE "roles" DROP CONSTRAINT "PK_roles_id_int";`);
        await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "id";`);
        await queryRunner.query(`ALTER TABLE "roles" RENAME COLUMN "id_uuid" TO "id";`);
        await queryRunner.query(`ALTER TABLE "roles" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4();`);
        await queryRunner.query(`ALTER TABLE "roles" ADD CONSTRAINT "PK_roles_id_uuid" PRIMARY KEY ("id");`);

        await queryRunner.query(`ALTER TABLE "role_permissions" DROP CONSTRAINT "UQ_role_permissions_role_id_resource_int";`);
        await queryRunner.query(`ALTER TABLE "role_permissions" DROP COLUMN "role_id";`);
        await queryRunner.query(`ALTER TABLE "role_permissions" RENAME COLUMN "role_id_old" TO "role_id";`);
        await queryRunner.query(`
        ALTER TABLE "role_permissions"
        ADD CONSTRAINT "FK_role_permissions_role_id_roles_uuid"
        FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE;
        `);
        await queryRunner.query(`
        ALTER TABLE "role_permissions"
        ADD CONSTRAINT "UQ_role_permissions_role_id_resource_uuid" UNIQUE ("role_id", "resource");
        `);

        await queryRunner.query(`DROP SEQUENCE IF EXISTS "roles_id_seq";`);
    }
}
