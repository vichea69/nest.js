import { Module } from "@nestjs/common";
import { CategoryController } from "@/Modules/category/category.controller";
import { CategoryService } from "@/Modules/category/category.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CategoryEntity } from "@/Modules/category/category.entity";

@Module(
    {
        imports: [TypeOrmModule.forFeature([CategoryEntity])],
        controllers: [CategoryController],
        providers: [CategoryService],
        exports: [CategoryService]

    }
)
export class CategoryModule {
}