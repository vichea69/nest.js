import { Module } from "@nestjs/common";
import { CategoryController } from "@/modules/category/category.controller";
import { CategoryService } from "@/modules/category/category.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CategoryEntity } from "@/modules/category/category.entity";
import { RolesGuard } from "@/modules/auth/guards/roles.guard";

@Module(
    {
        imports: [TypeOrmModule.forFeature([CategoryEntity])],
        controllers: [CategoryController],
        providers: [CategoryService, RolesGuard],
        exports: [CategoryService]

    }
)
export class CategoryModule {
}
