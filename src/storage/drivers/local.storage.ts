import * as fs from 'fs';
import * as path from 'path';

export class LocalStorage {
    static async upload(file: Express.Multer.File): Promise<string> {
        const uploadRoot = process.env.LOCAL_UPLOAD_PATH || 'uploads';

        // Absolute path: project-root/uploads
        const uploadDir = path.join(process.cwd(), uploadRoot);

        // Create folder if not exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, {recursive: true});
        }

        // Unique filename
        const filename = `${Date.now()}-${file.originalname}`;
        const filepath = path.join(uploadDir, filename);

        // Save file
        fs.writeFileSync(filepath, file.buffer);

        // Public URL
        return `/${uploadRoot}/${filename}`;
    }
}
