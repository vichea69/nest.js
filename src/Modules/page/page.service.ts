import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PageEntity, PageStatus } from '@/Modules/page/page.entity';
import { CreatePageDto } from '@/Modules/page/dto/create-page.dto';
import { UpdatePageDto } from '@/Modules/page/dto/update-page.dto';
import slugify from 'slugify';
import { UserEntity } from '@/user/user.entity';

@Injectable()
export class PageService {
  constructor(
    @InjectRepository(PageEntity)
    private readonly pageRepository: Repository<PageEntity>,
  ) {}

  async create(user: UserEntity, dto: CreatePageDto): Promise<PageEntity> {
    const slug = this.generateSlug(dto.title);

    const exists = await this.pageRepository.findOne({ where: { slug } });
    if (exists) {
      throw new HttpException('Page slug already exists', HttpStatus.UNPROCESSABLE_ENTITY);
    }

    const page = this.pageRepository.create({
      title: dto.title,
      slug,
      content: dto.content,
      status: dto.status ?? PageStatus.Draft,
      publishedAt: dto.status === PageStatus.Published ? new Date() : null,
      author: user ?? null,
      metaTitle: dto.metaTitle ?? null,
      metaDescription: dto.metaDescription ?? null,
    });

    return await this.pageRepository.save(page);
  }

  async findAll(page = 1, pageSize = 10, includeDrafts = false): Promise<{ items: PageEntity[]; total: number }> {
    const take = Math.min(Math.max(Number(pageSize) || 10, 1), 50);
    const current = Math.max(Number(page) || 1, 1);
    const skip = (current - 1) * take;

    const qb = this.pageRepository.createQueryBuilder('page')
      .leftJoinAndSelect('page.author', 'author')
      .orderBy('page.updatedAt', 'DESC')
      .take(take)
      .skip(skip);

    if (!includeDrafts) {
      qb.andWhere('page.status = :status', { status: PageStatus.Published });
    }

    const [items, total] = await qb.getManyAndCount();

    return { items, total };
  }

  async findBySlug(slug: string, includeDrafts = false): Promise<PageEntity> {
    const where: any = { slug };
    if (!includeDrafts) where.status = PageStatus.Published;
    const page = await this.pageRepository.findOne({ where, relations: ['author'] });
    if (!page) {
      throw new HttpException('Page not found', HttpStatus.NOT_FOUND);
    }
    return page;
  }

  async update(slug: string, dto: UpdatePageDto): Promise<PageEntity> {
    const page = await this.findBySlug(slug);

    // Handle title change -> regenerate slug if changed
    if (dto.title && dto.title.trim() && dto.title !== page.title) {
      const newSlug = this.generateSlug(dto.title);
      const exists = await this.pageRepository.findOne({ where: { slug: newSlug } });
      if (exists && exists.id !== page.id) {
        throw new HttpException('Page slug already exists', HttpStatus.UNPROCESSABLE_ENTITY);
      }
      page.slug = newSlug;
    }

    if (dto.status && dto.status !== page.status) {
      if (dto.status === PageStatus.Published && !page.publishedAt) {
        page.publishedAt = new Date();
      }
      if (dto.status === PageStatus.Draft) {
        page.publishedAt = null;
      }
    }

    Object.assign(page, {
      title: dto.title ?? page.title,
      content: dto.content ?? page.content,
      status: dto.status ?? page.status,
      metaTitle: dto.metaTitle ?? page.metaTitle,
      metaDescription: dto.metaDescription ?? page.metaDescription,
    });

    return await this.pageRepository.save(page);
  }

  async remove(slug: string): Promise<void> {
    const page = await this.findBySlug(slug);
    await this.pageRepository.remove(page);
  }

  private generateSlug(title: string): string {
    if (!title || typeof title !== 'string' || !title.trim()) {
      throw new HttpException('Invalid title', HttpStatus.BAD_REQUEST);
    }
    return slugify(title, { lower: true, strict: true, trim: true });
  }
}
