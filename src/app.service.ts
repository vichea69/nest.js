import {Injectable} from '@nestjs/common';

@Injectable()
export class AppService {
    getHello(): string {
        return 'Hey bro your API is running Now!! 🔥🏃';
    }
}
