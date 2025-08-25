import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PageEntity } from '@/Modules/page/page.entity';
import { PageService } from '@/Modules/page/page.service';
import { PageController } from '@/Modules/page/page.controller';
import { RolesGuard } from '@/user/guards/roles.guard';

@Module({
  imports: [TypeOrmModule.forFeature([PageEntity])],
  controllers: [PageController],
  providers: [PageService, RolesGuard],
  exports: [PageService],
})
export class PageModule {}
