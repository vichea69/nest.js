import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UsePipes, ValidationPipe } from "@nestjs/common";
import { CategoryService } from "@/Modules/category/category.service";
import { CreateCategoryDto } from "@/Modules/category/dto/create-category.dto";
import { UpdateCategoryDto } from "@/Modules/category/dto/update-category.dto";


@Controller("categories")
export class CategoryController {
    constructor(private categoryService: CategoryService) {
    }

    @Get()
    findAll() {
        return this.categoryService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.categoryService.findOne(id);
    }

    @Post()
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
    create(@Body() dto: CreateCategoryDto) {
        return this.categoryService.create(dto);
    }

    @Put(':id')
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCategoryDto) {
        return this.categoryService.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.categoryService.remove(id);
    }
}