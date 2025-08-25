import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuEntity } from '@/Modules/menu/menu.entity';
import { MenuItemEntity } from '@/Modules/menu/menuItem.entity';
import { MenuService } from '@/Modules/menu/menu.service';
import { MenuController } from '@/Modules/menu/menu.controller';
import { RolesGuard } from '@/user/guards/roles.guard';

@Module({
  imports: [TypeOrmModule.forFeature([MenuEntity, MenuItemEntity])],
  controllers: [MenuController],
  providers: [MenuService, RolesGuard],
  exports: [MenuService],
})
export class MenuModule {}

