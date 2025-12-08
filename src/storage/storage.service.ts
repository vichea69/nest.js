import {Injectable} from "@nestjs/common";
import {LocalStorage} from "@/storage/drivers/local.storage";

@Injectable()
export class StorageService {
    //for local folder
    async upload(file: Express.Multer.File): Promise<{ url: string }> {
        const url = await LocalStorage.upload(file);
        return {url};
    }
}