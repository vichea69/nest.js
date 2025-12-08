import {Injectable} from "@nestjs/common";
import {StorageService} from "@/storage/storage.service";
import {InjectRepository} from "@nestjs/typeorm";
import {Media} from "@/modules/media-manager/media.entity";
import {Repository} from "typeorm";
import {MediaResponseInterface} from "@/modules/media-manager/types/media-response-interface";


@Injectable()
export class MediaService {
    constructor(
        private readonly storageService: StorageService,
        @InjectRepository(Media)
        private readonly mediaRepo: Repository<Media>,
    ) {
    }

    async upload(file: Express.Multer.File): Promise<MediaResponseInterface> {
        const {url} = await this.storageService.upload(file);

        const media = this.mediaRepo.create({
            filename: file.originalname,
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            url,
            mediaType: 'image',
            storageDriver: 'local',
        });

        return this.mediaRepo.save(media);
    }

    async findAll(): Promise<MediaResponseInterface []> {
        return this.mediaRepo.find();
    }
}