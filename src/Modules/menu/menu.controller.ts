import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { MenuService } from '@/Modules/menu/menu.service';
import { CreateMenuDto } from '@/Modules/menu/dto/create-menu.dto';
import { UpdateMenuDto } from '@/Modules/menu/dto/update-menu.dto';
import { CreateMenuItemDto } from '@/Modules/menu/dto/create-menu-item.dto';
import { UpdateMenuItemDto } from '@/Modules/menu/dto/update-menu-item.dto';
import { AuthGuard } from '@/user/guards/auth.guard';
import { RolesGuard } from '@/user/guards/roles.guard';
import { Roles } from '@/user/decorators/roles.decorator';
import { Role } from '@/user/enums/role.enum';

@Controller('menus')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  // Menus
  @Get()
  async findAll() {
    const menus = await this.menuService.findAllMenus();
    return menus.map((m) => ({
      id: m.id,
      name: m.name,
      slug: m.slug,
      description: m.description,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    }));
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const m = await this.menuService.findMenuById(id);
    return {
      id: m.id,
      name: m.name,
      slug: m.slug,
      description: m.description,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    };
  }

  @Get('slug/:slug')
  async findTreeBySlug(@Param('slug') slug: string) {
    return await this.menuService.getMenuItemsBySlug(slug);
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Editor)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
  async create(@Body() dto: CreateMenuDto) {
    const m = await this.menuService.createMenu(dto);
    return {
      id: m.id,
      name: m.name,
      slug: m.slug,
      description: m.description,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    };
  }

  @Put(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Editor)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMenuDto) {
    const m = await this.menuService.updateMenu(id, dto);
    return {
      id: m.id,
      name: m.name,
      slug: m.slug,
      description: m.description,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    };
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Editor)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.menuService.removeMenu(id);
    return { message: 'Menu deleted' };
  }

  // Menu Items
  @Get(':menuId/items')
  async getItems(@Param('menuId', ParseIntPipe) menuId: number) {
    return await this.menuService.getMenuItems(menuId);
  }

  @Post(':menuId/items')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Editor)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
  async createItem(@Param('menuId', ParseIntPipe) menuId: number, @Body() dto: CreateMenuItemDto) {
    const i = await this.menuService.createMenuItem(menuId, dto);
    return {
      id: i.id,
      label: i.label,
      url: i.url ?? null,
      pageSlug: i.pageSlug ?? null,
      external: i.external,
      target: i.target ?? null,
      icon: i.icon ?? null,
      orderIndex: i.orderIndex,
      parentId: i.parent ? i.parent.id : null,
      createdAt: i.createdAt,
      updatedAt: i.updatedAt,
    };
  }

  @Put(':menuId/items/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Editor)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
  async updateItem(
    @Param('menuId', ParseIntPipe) menuId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMenuItemDto,
  ) {
    const i = await this.menuService.updateMenuItem(menuId, id, dto);
    return {
      id: i.id,
      label: i.label,
      url: i.url ?? null,
      pageSlug: i.pageSlug ?? null,
      external: i.external,
      target: i.target ?? null,
      icon: i.icon ?? null,
      orderIndex: i.orderIndex,
      parentId: i.parent ? i.parent.id : null,
      createdAt: i.createdAt,
      updatedAt: i.updatedAt,
    };
  }

  @Delete(':menuId/items/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Editor)
  async removeItem(@Param('menuId', ParseIntPipe) menuId: number, @Param('id', ParseIntPipe) id: number) {
    await this.menuService.removeMenuItem(menuId, id);
    return { message: 'Menu item deleted' };
  }
}

