import { Module } from "@nestjs/common";
import { ArticleController } from "./article.controller";
import { ArticleService } from "./article.serverice";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ArticleEntity } from "./article.entity";
import { UserEntity } from "@/modules/users/entities/user.entity";
import { RoleModule } from "@/modules/roles/role.module";

@Module({
    imports: [TypeOrmModule.forFeature([ArticleEntity, UserEntity]), RoleModule],
    controllers: [ArticleController],
    providers: [ArticleService],
    exports: [ArticleService]
})
export class ArticleModule { }
