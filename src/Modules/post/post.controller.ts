import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { PostService } from '@/modules/post/post.service';
import { CreatePostDto } from '@/modules/post/dto/create-post.dto';
import { UpdatePostDto } from '@/modules/post/dto/update-post.dto';
import { AuthGuard } from '@/modules/auth/guards/auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/modules/auth/decorators/roles.decorator';
import { Role } from '@/modules/auth/enums/role.enum';
import { User } from '@/modules/auth/decorators/user.decorator';
import { UserEntity } from '@/modules/users/entities/user.entity';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  findAll() {
    return this.postService.findAll().then((items) =>
      items.map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        content: p.content,
        status: p.status,
        imageUrl: p.imageUrl ?? null,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        author: p.author ? { id: p.author.id, displayName: p.author.username, email: p.author.email } : null,
        category: p.category ? { id: p.category.id, name: p.category.name } : null,
        page: p.page ? { id: p.page.id, title: p.page.title, slug: p.page.slug } : null,
      })),
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postService.findOne(id).then((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      content: p.content,
      status: p.status,
      imageUrl: p.imageUrl ?? null,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      author: p.author ? { id: p.author.id, displayName: p.author.username, email: p.author.email } : null,
      category: p.category ? { id: p.category.id, name: p.category.name } : null,
      page: p.page ? { id: p.page.id, title: p.page.title, slug: p.page.slug } : null,
    }));
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Editor)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  )
  create(
    @User() user: UserEntity,
    @Body() dto: CreatePostDto,
    @UploadedFile() file?: any,
  ) {
    return this.postService.create(user, dto, file).then((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      content: p.content,
      status: p.status,
      imageUrl: p.imageUrl ?? null,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      author: p.author ? { id: p.author.id, displayName: p.author.username, email: p.author.email } : null,
      category: p.category ? { id: p.category.id, name: p.category.name } : null,
      page: p.page ? { id: p.page.id, title: p.page.title, slug: p.page.slug } : null,
    }));
  }

  @Put(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Editor)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePostDto,
    @UploadedFile() file?: any,
  ) {
    return this.postService.update(id, dto, file).then((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      content: p.content,
      status: p.status,
      imageUrl: p.imageUrl ?? null,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      author: p.author ? { id: p.author.id, displayName: p.author.username, email: p.author.email } : null,
      category: p.category ? { id: p.category.id, name: p.category.name } : null,
      page: p.page ? { id: p.page.id, title: p.page.title, slug: p.page.slug } : null,
    }));
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Editor)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.postService.remove(id);
  }
}
