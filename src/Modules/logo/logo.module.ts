import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogoEntity } from '@/modules/logo/logo.entity';
import { LogoService } from '@/modules/logo/logo.service';
import { LogoController } from '@/modules/logo/logo.controller';
import { S3Service } from '@/modules/logo/s3.service';

@Module({
  imports: [TypeOrmModule.forFeature([LogoEntity])],
  controllers: [LogoController],
  providers: [LogoService, S3Service],
  exports: [LogoService],
})
export class LogoModule {}
