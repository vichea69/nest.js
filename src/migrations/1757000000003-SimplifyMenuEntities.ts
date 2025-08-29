import { MigrationInterface, QueryRunner } from "typeorm";

export class SimplifyMenuEntities1757000000003 implements MigrationInterface {
    name = 'SimplifyMenuEntities1757000000003'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop optional columns from menu_items
        const table = 'menu_items';
        const hasColumn = async (name: string) => {
            const cols = await queryRunner.getTable(table);
            return !!cols?.findColumnByName(name);
        };

        if (await hasColumn('pageSlug')) {
            await queryRunner.query(`ALTER TABLE "menu_items" DROP COLUMN "pageSlug"`);
        }
        if (await hasColumn('external')) {
            await queryRunner.query(`ALTER TABLE "menu_items" DROP COLUMN "external"`);
        }
        if (await hasColumn('target')) {
            await queryRunner.query(`ALTER TABLE "menu_items" DROP COLUMN "target"`);
        }
        if (await hasColumn('icon')) {
            await queryRunner.query(`ALTER TABLE "menu_items" DROP COLUMN "icon"`);
        }

        // Drop description from menus if exists
        const menusHasDescription = await queryRunner.getTable('menus').then(t => !!t?.findColumnByName('description'));
        if (menusHasDescription) {
            await queryRunner.query(`ALTER TABLE "menus" DROP COLUMN "description"`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Recreate description on menus
        await queryRunner.query(`ALTER TABLE "menus" ADD COLUMN IF NOT EXISTS "description" text DEFAULT ''`);

        // Recreate columns on menu_items
        await queryRunner.query(`ALTER TABLE "menu_items" ADD COLUMN IF NOT EXISTS "pageSlug" character varying(240)`);
        await queryRunner.query(`ALTER TABLE "menu_items" ADD COLUMN IF NOT EXISTS "external" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "menu_items" ADD COLUMN IF NOT EXISTS "target" character varying(20)`);
        await queryRunner.query(`ALTER TABLE "menu_items" ADD COLUMN IF NOT EXISTS "icon" character varying(120)`);
    }
}

