import {Injectable} from '@nestjs/common';

@Injectable()
export class AppService {
    getHello(): string {
        return 'Yo Bro your API is running Now!! 🔥🏃';
    }
}
