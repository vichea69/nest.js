import { Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { TagEntity } from "@/tag/tag.entity";
import { Repository } from "typeorm";

@Injectable()
export class TagService {
    constructor(
        @InjectRepository(TagEntity)
        private readonly tagRepository: Repository<TagEntity>) {
    }

    async findAll() {
        return await this.tagRepository.find();
    }
}
