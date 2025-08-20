import { Module } from "@nestjs/common";
import { ArticleController } from "./article.controller";
import { ArticleService } from "./article.serverice";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ArticleEntity } from "./article.entity";
import { UserEntity } from "@/user/user.entity";
import { RolesGuard } from "@/user/guards/roles.guard";

@Module({
    imports: [TypeOrmModule.forFeature([ArticleEntity, UserEntity])],
    controllers: [ArticleController],
    providers: [ArticleService, RolesGuard],
    exports: [ArticleService]
})
export class ArticleModule { }