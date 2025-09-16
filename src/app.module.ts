import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import ormconfig from "@/ormconfig";
import {UserModule} from './user/user.module';
import {ConfigModule} from '@nestjs/config';
import {ArticleModule} from './article/article.module';
import {CategoryModule} from "@/Modules/category/category.module";
import { PageModule } from '@/Modules/page/page.module';
import { MenuModule } from '@/Modules/menu/menu.module';
import { PostModule } from '@/Modules/post/post.module';
import { LogoModule } from '@/Modules/logo/logo.module';


@Module({
    imports: [
        TypeOrmModule.forRoot(ormconfig),
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        UserModule,
        ArticleModule,
        CategoryModule,
        PageModule,
        MenuModule,
        PostModule,
        LogoModule
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {
}
