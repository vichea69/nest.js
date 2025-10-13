import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { CategoryService } from "@/modules/category/category.service";
import { CreateCategoryDto } from "@/modules/category/dto/create-category.dto";
import { UpdateCategoryDto } from "@/modules/category/dto/update-category.dto";
import { AuthGuard } from "@/modules/auth/guards/auth.guard";
import { PermissionsGuard } from "@/modules/roles/guards/permissions.guard";
import { Permissions } from "@/modules/roles/decorator/permissions.decorator";
import { Resource } from "@/modules/roles/enums/resource.enum";
import { Action } from "@/modules/roles/enums/actions.enum";
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
    @UseGuards(AuthGuard, PermissionsGuard)
    @Permissions({ resource: Resource.Categories, actions: [Action.Create] })
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
    @UseGuards(AuthGuard, PermissionsGuard)
    @Permissions({ resource: Resource.Categories, actions: [Action.Update] })
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
    @UseGuards(AuthGuard, PermissionsGuard)
    @Permissions({ resource: Resource.Categories, actions: [Action.Delete] })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.categoryService.remove(id);
    }
}
