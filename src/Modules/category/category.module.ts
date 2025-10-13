import { Module } from "@nestjs/common";
import { CategoryController } from "@/modules/category/category.controller";
import { CategoryService } from "@/modules/category/category.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CategoryEntity } from "@/modules/category/category.entity";
import { RoleModule } from "@/modules/roles/role.module";

@Module(
    {
        imports: [TypeOrmModule.forFeature([CategoryEntity]), RoleModule],
        controllers: [CategoryController],
        providers: [CategoryService],
        exports: [CategoryService]

    }
)
export class CategoryModule {
}
