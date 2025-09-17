import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from '@/modules/post/post.entity';
import { PostService } from '@/modules/post/post.service';
import { PostController } from '@/modules/post/post.controller';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { R2Service } from '@/modules/post/r2.service';
import { CategoryEntity } from '@/modules/category/category.entity';
import { PageEntity } from '@/modules/page/page.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PostEntity, CategoryEntity, PageEntity])],
  controllers: [PostController],
  providers: [PostService, RolesGuard, R2Service],
  exports: [PostService],
})
export class PostModule {}
