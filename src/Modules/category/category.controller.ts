import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { CategoryService } from "@/modules/category/category.service";
import { CreateCategoryDto } from "@/modules/category/dto/create-category.dto";
import { UpdateCategoryDto } from "@/modules/category/dto/update-category.dto";
import { AuthGuard } from "@/modules/auth/guards/auth.guard";
import { RolesGuard } from "@/modules/auth/guards/roles.guard";
import { Roles } from "@/modules/auth/decorators/roles.decorator";
import { Role } from "@/modules/auth/enums/role.enum";
import { User } from "@/modules/auth/decorators/user.decorator";
import { UserEntity } from "@/modules/users/entities/user.entity";


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
