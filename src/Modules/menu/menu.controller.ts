import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { MenuService } from '@/modules/menu/menu.service';
import { CreateMenuDto } from '@/modules/menu/dto/create-menu.dto';
import { UpdateMenuDto } from '@/modules/menu/dto/update-menu.dto';
import { CreateMenuItemDto } from '@/modules/menu/dto/create-menu-item.dto';
import { UpdateMenuItemDto } from '@/modules/menu/dto/update-menu-item.dto';
import { AuthGuard } from '@/modules/auth/guards/auth.guard';
import { PermissionsGuard } from '@/modules/roles/guards/permissions.guard';
import { Permissions } from '@/modules/roles/decorator/permissions.decorator';
import { Resource } from '@/modules/roles/enums/resource.enum';
import { Action } from '@/modules/roles/enums/actions.enum';

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
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    }));
  }

  @Get('slug/:slug')
  async findTreeBySlug(@Param('slug') slug: string) {
    return await this.menuService.getMenuItemsBySlug(slug);
  }

  @Get('slug/:slug/tree')
  async findMenuWithTree(@Param('slug') slug: string) {
    return await this.menuService.getMenuWithTreeBySlug(slug);
  }

  @Get('tree')
  async findAllWithItems() {
    return await this.menuService.findAllMenusWithItems();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const m = await this.menuService.findMenuById(id);
    return {
      id: m.id,
      name: m.name,
      slug: m.slug,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    };
  }

  @Post()
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions({ resource: Resource.Menu, actions: [Action.Create] })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
  async create(@Body() dto: CreateMenuDto) {
    const m = await this.menuService.createMenu(dto);
    return {
      id: m.id,
      name: m.name,
      slug: m.slug,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    };
  }

  @Put(':id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions({ resource: Resource.Menu, actions: [Action.Update] })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMenuDto) {
    const m = await this.menuService.updateMenu(id, dto);
    return {
      id: m.id,
      name: m.name,
      slug: m.slug,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    };
  }

  @Delete(':id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions({ resource: Resource.Menu, actions: [Action.Delete] })
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
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions({ resource: Resource.Menu, actions: [Action.Create] })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
  async createItem(@Param('menuId', ParseIntPipe) menuId: number, @Body() dto: CreateMenuItemDto) {
    const i = await this.menuService.createMenuItem(menuId, dto);
    return {
      id: i.id,
      label: i.label,
      url: i.url ?? null,
      orderIndex: i.orderIndex,
      parentId: i.parent ? i.parent.id : null,
      createdAt: i.createdAt,
      updatedAt: i.updatedAt,
    };
  }

  @Put(':menuId/items/:id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions({ resource: Resource.Menu, actions: [Action.Update] })
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
      orderIndex: i.orderIndex,
      parentId: i.parent ? i.parent.id : null,
      createdAt: i.createdAt,
      updatedAt: i.updatedAt,
    };
  }

  @Delete(':menuId/items/:id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions({ resource: Resource.Menu, actions: [Action.Delete] })
  async removeItem(@Param('menuId', ParseIntPipe) menuId: number, @Param('id', ParseIntPipe) id: number) {
    await this.menuService.removeMenuItem(menuId, id);
    return { message: 'Menu item deleted' };
  }
}
