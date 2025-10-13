import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuEntity } from '@/modules/menu/menu.entity';
import { MenuItemEntity } from '@/modules/menu/menuItem.entity';
import { MenuService } from '@/modules/menu/menu.service';
import { MenuController } from '@/modules/menu/menu.controller';
import { RoleModule } from '@/modules/roles/role.module';

@Module({
  imports: [TypeOrmModule.forFeature([MenuEntity, MenuItemEntity]), RoleModule],
  controllers: [MenuController],
  providers: [MenuService],
  exports: [MenuService],
})
export class MenuModule {}
