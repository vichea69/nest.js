import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {TagModule} from './tag/tag.module';
import {TypeOrmModule} from "@nestjs/typeorm";
import ormconfig from "@/ormconfig";
import {UserModule} from './user/user.module';
import {ConfigModule} from '@nestjs/config';
import {ArticleModule} from './article/article.module';
import {ProfileModule} from './profile/profile.module';
import {CategoryModule} from "@/Modules/category/category.module";
import { PageModule } from '@/Modules/page/page.module';
import { MenuModule } from '@/Modules/menu/menu.module';
import { PostModule } from '@/Modules/post/post.module';


@Module({
    imports: [
        TypeOrmModule.forRoot(ormconfig),
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        TagModule,
        UserModule,
        ArticleModule,
        ProfileModule,
        CategoryModule,
        PageModule,
        MenuModule,
        PostModule
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {
}
