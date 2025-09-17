import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuEntity } from '@/modules/menu/menu.entity';
import { MenuItemEntity } from '@/modules/menu/menuItem.entity';
import { MenuService } from '@/modules/menu/menu.service';
import { MenuController } from '@/modules/menu/menu.controller';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';

@Module({
  imports: [TypeOrmModule.forFeature([MenuEntity, MenuItemEntity])],
  controllers: [MenuController],
  providers: [MenuService, RolesGuard],
  exports: [MenuService],
})
export class MenuModule {}

