import { Controller, Get } from '@nestjs/common';
import { TagService } from './tag.service';

@Controller('/tags')
export class TagController {
    constructor(private readonly tagService: TagService) {
    }

    @Get()
    async findAll() {
        const allTags = await this.tagService.findAll();
        const tags: string[] = allTags.map((tag) => tag.name);
        return {
            tags
        }
    }
}
