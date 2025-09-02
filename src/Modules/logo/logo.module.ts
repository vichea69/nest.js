import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogoEntity } from '@/Modules/logo/logo.entity';
import { LogoService } from '@/Modules/logo/logo.service';
import { LogoController } from '@/Modules/logo/logo.controller';
import { S3Service } from '@/Modules/logo/s3.service';

@Module({
  imports: [TypeOrmModule.forFeature([LogoEntity])],
  controllers: [LogoController],
  providers: [LogoService, S3Service],
  exports: [LogoService],
})
export class LogoModule {}
