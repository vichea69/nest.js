import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PageEntity } from '@/modules/page/page.entity';
import { PageService } from '@/modules/page/page.service';
import { PageController } from '@/modules/page/page.controller';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';

@Module({
  imports: [TypeOrmModule.forFeature([PageEntity])],
  controllers: [PageController],
  providers: [PageService, RolesGuard],
  exports: [PageService],
})
export class PageModule {}
