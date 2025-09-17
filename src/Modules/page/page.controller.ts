import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { PageService } from '@/modules/page/page.service';
import { CreatePageDto } from '@/modules/page/dto/create-page.dto';
import { UpdatePageDto } from '@/modules/page/dto/update-page.dto';
import { AuthGuard } from '@/modules/auth/guards/auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/modules/auth/decorators/roles.decorator';
import { Role } from '@/modules/auth/enums/role.enum';
import { User } from '@/modules/auth/decorators/user.decorator';
import { UserEntity } from '@/modules/users/entities/user.entity';

@Controller('pages')
export class PageController {
  constructor(private readonly pageService: PageService) {}

  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('includeDrafts') includeDrafts?: string,
    @User() user?: UserEntity,
  ) {
    const current = Math.max(Number(page) || 1, 1);
    const size = Math.min(Math.max(Number(pageSize) || 10, 1), 50);
    // Always include both draft and published pages
    const { items, total } = await this.pageService.findAll(current, size, true);

    const data = items.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      status: p.status,
      content: p.content,
      publishedAt: p.publishedAt ?? null,
      updatedAt: p.updatedAt,
      authorId: p.author
        ? { id: p.author.id, displayName: p.author.username, email: p.author.email }
        : null,
      seo: {
        metaTitle: p.metaTitle ?? null,
        metaDescription: p.metaDescription ?? null,
      },
    }));

    // Return minimal paginated shape
    return {
      page: current,
      pageSize: size,
      total,
      data,
    };
  }

  @Get(':slug')
  async findOne(
    @Param('slug') slug: string,
    @Query('includeDrafts') includeDrafts?: string,
    @User() user?: UserEntity,
  ) {
    const isPrivileged = user?.role === Role.Admin || user?.role === Role.Editor;
    const wantsDrafts = ['true','1','yes','y'].includes(String(includeDrafts).toLowerCase());
    // Allow drafts if:
    // - Admin/Editor (default, unless includeDrafts=false), or
    // - Client explicitly asks via includeDrafts=true (useful for previews)
    const canViewDrafts = (isPrivileged && (includeDrafts === undefined || wantsDrafts)) || (!isPrivileged && wantsDrafts);
    const p = await this.pageService.findBySlug(slug, canViewDrafts);
    return {
      id: p.id,
      title: p.title,
      slug: p.slug,
      status: p.status,
      content: p.content,
      publishedAt: p.publishedAt ?? null,
      updatedAt: p.updatedAt,
      authorId: p.author ? { id: p.author.id, displayName: p.author.username, email: p.author.email } : null,
      seo: {
        metaTitle: p.metaTitle ?? null,
        metaDescription: p.metaDescription ?? null,
      },
    };
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Editor)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
  create(@User() user: UserEntity, @Body() dto: CreatePageDto) {
    return this.pageService.create(user, dto);
  }

  @Put(':slug')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Editor)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
  update(@Param('slug') slug: string, @Body() dto: UpdatePageDto) {
    return this.pageService.update(slug, dto);
  }

  @Delete(':slug')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Editor)
  remove(@Param('slug') slug: string) {
    return this.pageService.remove(slug);
  }
}
