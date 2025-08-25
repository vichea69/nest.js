import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CategoryEntity } from "@/Modules/category/category.entity";
import { CreateCategoryDto } from "@/Modules/category/dto/create-category.dto";
import { UpdateCategoryDto } from "@/Modules/category/dto/update-category.dto";
import { UserEntity } from "@/user/user.entity";

@Injectable()
export class CategoryService {
    constructor(
        @InjectRepository(CategoryEntity)
        private readonly categoryRepository: Repository<CategoryEntity>,
    ) {}

    async create(user: UserEntity, dto: CreateCategoryDto): Promise<CategoryEntity> {
        const existing = await this.categoryRepository.findOne({ where: { name: dto.name } });
        if (existing) {
            throw new HttpException('Category name already exists', HttpStatus.UNPROCESSABLE_ENTITY);
        }
        const category = this.categoryRepository.create({ ...dto, createdBy: user ?? null });
        return await this.categoryRepository.save(category);
    }

    async findAll(): Promise<CategoryEntity[]> {
        return await this.categoryRepository.find({ order: { createdAt: 'DESC' }, relations: ['createdBy'] });
    }

    async findOne(id: number): Promise<CategoryEntity> {
        const category = await this.categoryRepository.findOne({ where: { id }, relations: ['createdBy'] });
        if (!category) {
            throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
        }
        return category;
    }

    async update(id: number, dto: UpdateCategoryDto): Promise<CategoryEntity> {
        const category = await this.findOne(id);
        if (dto.name && dto.name !== category.name) {
            const exists = await this.categoryRepository.findOne({ where: { name: dto.name } });
            if (exists) {
                throw new HttpException('Category name already exists', HttpStatus.UNPROCESSABLE_ENTITY);
            }
        }
        Object.assign(category, dto);
        return await this.categoryRepository.save(category);
    }

    async remove(id: number): Promise<void> {
        const category = await this.findOne(id);
        await this.categoryRepository.remove(category);
    }

}
