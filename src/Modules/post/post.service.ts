import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostEntity, PostStatus } from '@/Modules/post/post.entity';
import slugify from 'slugify';
import { CreatePostDto } from '@/Modules/post/dto/create-post.dto';
import { UpdatePostDto } from '@/Modules/post/dto/update-post.dto';
import { UserEntity } from '@/user/user.entity';
import { R2Service } from '@/Modules/post/r2.service';
import { CategoryEntity } from '@/Modules/category/category.entity';
import { PageEntity } from '@/Modules/page/page.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
    @InjectRepository(PageEntity)
    private readonly pageRepository: Repository<PageEntity>,
    private readonly r2: R2Service,
  ) {}

  async create(user: UserEntity, dto: CreatePostDto, file?: any): Promise<PostEntity> {
    const slug = this.generateSlug(dto.title);

    const exists = await this.postRepository.findOne({ where: { slug } });
    if (exists) {
      throw new HttpException('Post slug already exists', HttpStatus.UNPROCESSABLE_ENTITY);
    }

    const post = this.postRepository.create({
      title: dto.title,
      slug,
      content: dto.content ?? '',
      status: dto.status ?? PostStatus.Draft,
      author: user ?? null,
    });

    // Attach relations if provided
    if (dto.categoryId) {
      const category = await this.categoryRepository.findOne({ where: { id: dto.categoryId } });
      if (!category) {
        throw new HttpException('Category not found', HttpStatus.UNPROCESSABLE_ENTITY);
      }
      post.category = category;
    }
    if (dto.pageId) {
      const page = await this.pageRepository.findOne({ where: { id: dto.pageId } });
      if (!page) {
        throw new HttpException('Page not found', HttpStatus.UNPROCESSABLE_ENTITY);
      }
      post.page = page;
    }

    if (file) {
      const key = this.generateObjectKey(file.originalname);
      const url = await this.r2.uploadObject({ key, body: file.buffer, contentType: file.mimetype });
      post.imageUrl = url;
    }

    return await this.postRepository.save(post);
  }

  async findAll(): Promise<PostEntity[]> {
    return await this.postRepository.find({ order: { createdAt: 'DESC' }, relations: ['author', 'category', 'page'] });
  }

  async findOne(id: number): Promise<PostEntity> {
    const post = await this.postRepository.findOne({ where: { id }, relations: ['author', 'category', 'page'] });
    if (!post) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }
    return post;
  }

  async update(id: number, dto: UpdatePostDto, file?: any): Promise<PostEntity> {
    const post = await this.findOne(id);

    if (file) {
      const key = this.generateObjectKey(file.originalname);
      const url = await this.r2.uploadObject({ key, body: file.buffer, contentType: file.mimetype });
      post.imageUrl = url;
    }

    // If title changes, update slug (ensure uniqueness)
    if (dto.title && dto.title.trim() && dto.title !== post.title) {
      const newSlug = this.generateSlug(dto.title);
      const exists = await this.postRepository.findOne({ where: { slug: newSlug } });
      if (exists && exists.id !== post.id) {
        throw new HttpException('Post slug already exists', HttpStatus.UNPROCESSABLE_ENTITY);
      }
      post.slug = newSlug;
    }

    Object.assign(post, {
      title: dto.title ?? post.title,
      content: dto.content ?? post.content,
      status: dto.status ?? post.status,
    });

    // Update relations if provided (allow clearing with 0/undefined? keep simple: only set if provided)
    if (dto.categoryId !== undefined) {
      if (dto.categoryId === null as any) {
        post.category = null;
      } else {
        const category = await this.categoryRepository.findOne({ where: { id: dto.categoryId } });
        if (!category) {
          throw new HttpException('Category not found', HttpStatus.UNPROCESSABLE_ENTITY);
        }
        post.category = category;
      }
    }
    if (dto.pageId !== undefined) {
      if (dto.pageId === null as any) {
        post.page = null;
      } else {
        const page = await this.pageRepository.findOne({ where: { id: dto.pageId } });
        if (!page) {
          throw new HttpException('Page not found', HttpStatus.UNPROCESSABLE_ENTITY);
        }
        post.page = page;
      }
    }

    return await this.postRepository.save(post);
  }

  async remove(id: number): Promise<void> {
    const post = await this.findOne(id);
    await this.postRepository.remove(post);
  }

  private generateObjectKey(originalName: string): string {
    const ext = originalName.includes('.') ? originalName.split('.').pop() : 'bin';
    const random = Math.random().toString(36).slice(2);
    const stamp = Date.now();
    return `uploads/posts/${stamp}-${random}.${ext}`;
  }

  private generateSlug(title: string): string {
    if (!title || typeof title !== 'string' || !title.trim()) {
      throw new HttpException('Invalid title', HttpStatus.BAD_REQUEST);
    }
    return slugify(title, { lower: true, strict: true, trim: true });
  }
}
