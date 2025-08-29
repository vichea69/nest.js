import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from '@/Modules/post/post.entity';
import { PostService } from '@/Modules/post/post.service';
import { PostController } from '@/Modules/post/post.controller';
import { RolesGuard } from '@/user/guards/roles.guard';
import { R2Service } from '@/Modules/post/r2.service';
import { CategoryEntity } from '@/Modules/category/category.entity';
import { PageEntity } from '@/Modules/page/page.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PostEntity, CategoryEntity, PageEntity])],
  controllers: [PostController],
  providers: [PostService, RolesGuard, R2Service],
  exports: [PostService],
})
export class PostModule {}
