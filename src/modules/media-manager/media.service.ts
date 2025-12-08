import {Injectable, NotFoundException} from "@nestjs/common";
import {StorageService} from "@/storage/storage.service";
import {InjectRepository} from "@nestjs/typeorm";
import {Media} from "@/modules/media-manager/media.entity";
import {Repository} from "typeorm";
import {MediaResponseInterface} from "@/modules/media-manager/types/media-response-interface";
import {detectMediaType} from "@/storage/helpers/media-type.helper";
import path from "node:path";
import * as fs from "node:fs";


@Injectable()
export class MediaService {
    constructor(
        private readonly storageService: StorageService,
        @InjectRepository(Media)
        private readonly mediaRepo: Repository<Media>,
    ) {
    }

    //upload any type of file
    async upload(file: Express.Multer.File): Promise<MediaResponseInterface> {
        const {url} = await this.storageService.upload(file);

        const media = this.mediaRepo.create({
            filename: file.originalname,
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            url,
            mediaType: detectMediaType(file.mimetype),
            storageDriver: 'local',
        });

        return this.mediaRepo.save(media);
    }

    //Get all Media
    async findAll(): Promise<MediaResponseInterface []> {
        return this.mediaRepo.find();
    }

    //Get by id or Get one
    async findOne(id: number) {
        const media = await this.mediaRepo.findOne({
            where: {id},
        });

        if (!media) {
            throw new NotFoundException(`Media with ID ${id} not found`);
        }

        return media;
    }

    //Delete
    async remove(id: number) {
        const media = await this.mediaRepo.findOne({where: {id}});

        if (!media) {
            throw new NotFoundException(`Media with ID ${id} not found`);
        }
        // Delete local file
        if (media.storageDriver === 'local') {
            const filePath = path.join(
                process.cwd(),
                media.url.replace('/', ''),
            );

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await this.mediaRepo.remove(media);

        return {
            message: 'Media deleted successfully',
        };
    }
}