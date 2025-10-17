import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddLinkAndDescriptionToLogos1760673914346 implements MigrationInterface {
    name = 'AddLinkAndDescriptionToLogos1760673914346'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('logos');
        if (!table) {
            throw new Error('Table "logos" not found');
        }

        const descriptionColumn = table.findColumnByName('description');
        if (!descriptionColumn) {
            await queryRunner.addColumn(
                'logos',
                new TableColumn({
                    name: 'description',
                    type: 'varchar',
                    length: '400',
                    isNullable: true,
                }),
            );
            await queryRunner.query(`UPDATE "logos" SET "description" = '' WHERE "description" IS NULL`);
            await queryRunner.query(`ALTER TABLE "logos" ALTER COLUMN "description" SET NOT NULL`);
        }

        const linkColumn = table.findColumnByName('link');
        if (!linkColumn) {
            await queryRunner.addColumn(
                'logos',
                new TableColumn({
                    name: 'link',
                    type: 'varchar',
                    length: '600',
                    isNullable: true,
                }),
            );
            await queryRunner.query(`UPDATE "logos" SET "link" = '' WHERE "link" IS NULL`);
            await queryRunner.query(`ALTER TABLE "logos" ALTER COLUMN "link" SET NOT NULL`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('logos');
        if (!table) return;

        const linkColumn = table.findColumnByName('link');
        if (linkColumn) {
            await queryRunner.dropColumn('logos', linkColumn);
        }

        const descriptionColumn = table.findColumnByName('description');
        if (descriptionColumn) {
            await queryRunner.dropColumn('logos', descriptionColumn);
        }
    }

}
