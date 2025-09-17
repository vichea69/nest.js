import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import ormconfig from "@/ormconfig";
import { AuthModule } from '@/modules/auth/auth.module';
import { UsersModule } from '@/modules/users/users.module';
import {ConfigModule} from '@nestjs/config';
import {ArticleModule} from '@/modules/articles/article.module';
import {CategoryModule} from "@/modules/category/category.module";
import { PageModule } from '@/modules/page/page.module';
import { MenuModule } from '@/modules/menu/menu.module';
import { PostModule } from '@/modules/post/post.module';
import { LogoModule } from '@/modules/logo/logo.module';


@Module({
    imports: [
        TypeOrmModule.forRoot(ormconfig),
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        AuthModule,
        UsersModule,
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
