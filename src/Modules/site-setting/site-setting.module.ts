import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SiteSettingController } from '@/modules/site-setting/site-setting.controller';
import { SiteSettingService } from '@/modules/site-setting/site-setting.service';
import { SiteSettingEntity } from '@/modules/site-setting/site-setting.entity';
import { RoleModule } from '@/modules/roles/role.module';
import { R2Service } from '@/modules/site-setting/r2.service';

@Module({
  imports: [TypeOrmModule.forFeature([SiteSettingEntity]), RoleModule],
  controllers: [SiteSettingController],
  providers: [SiteSettingService, R2Service],
  exports: [SiteSettingService],
})
export class SiteSettingModule {}
