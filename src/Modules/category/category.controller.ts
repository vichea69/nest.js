import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { CategoryService } from "@/Modules/category/category.service";
import { CreateCategoryDto } from "@/Modules/category/dto/create-category.dto";
import { UpdateCategoryDto } from "@/Modules/category/dto/update-category.dto";
import { AuthGuard } from "@/user/guards/auth.guard";
import { RolesGuard } from "@/user/guards/roles.guard";
import { Roles } from "@/user/decorators/roles.decorator";
import { Role } from "@/user/enums/role.enum";
import { User } from "@/user/decorators/user.decorator";
import { UserEntity } from "@/user/user.entity";


@Controller("categories")
export class CategoryController {
    constructor(private categoryService: CategoryService) {
    }

    @Get()
    findAll() {
        return this.categoryService.findAll().then(categories =>
            categories.map((c) => ({
                id: c.id,
                name: c.name,
                description: c.description,
                createdAt: c.createdAt,
                updatedAt: c.updatedAt,
                createdBy: c.createdBy
                    ? { id: c.createdBy.id, displayName: c.createdBy.username, email: c.createdBy.email }
                    : null,
            }))
        );
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.categoryService.findOne(id).then((c) => ({
            id: c.id,
            name: c.name,
            description: c.description,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
            createdBy: c.createdBy
                ? { id: c.createdBy.id, displayName: c.createdBy.username, email: c.createdBy.email }
                : null,
        }));
    }

    @Post()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Admin, Role.Editor)
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
    create(@User() user: UserEntity, @Body() dto: CreateCategoryDto) {
        return this.categoryService.create(user, dto).then((c) => ({
            id: c.id,
            name: c.name,
            description: c.description,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
            createdBy: c.createdBy
                ? { id: c.createdBy.id, displayName: c.createdBy.username, email: c.createdBy.email }
                : null,
        }));
    }

    @Put(':id')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Admin, Role.Editor)
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCategoryDto) {
        return this.categoryService.update(id, dto).then((c) => ({
            id: c.id,
            name: c.name,
            description: c.description,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
            createdBy: c.createdBy
                ? { id: c.createdBy.id, displayName: c.createdBy.username, email: c.createdBy.email }
                : null,
        }));
    }

    @Delete(':id')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Admin, Role.Editor)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.categoryService.remove(id);
    }
}
