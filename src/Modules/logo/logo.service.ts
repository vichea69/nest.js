import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LogoEntity } from '@/Modules/logo/logo.entity';
import { UpdateLogoDto } from '@/Modules/logo/dto/update-logo.dto';
import { UploadLogoDto } from '@/Modules/logo/dto/upload-logo.dto';
import { S3Service } from '@/Modules/logo/s3.service';

@Injectable()
export class LogoService {
  constructor(
    @InjectRepository(LogoEntity)
    private readonly logoRepository: Repository<LogoEntity>,
    private readonly s3: S3Service,
  ) {}

  async getCurrent(): Promise<LogoEntity> {
    const [logo] = await this.logoRepository.find({ order: { createdAt: 'DESC' }, take: 1 });
    if (!logo) {
      throw new HttpException('Logo not found', HttpStatus.NOT_FOUND);
    }
    return logo;
  }
  async findAll(): Promise<LogoEntity[]> {
    return await this.logoRepository.find();
  }
  async getCurrentOrNull(): Promise<LogoEntity | null> {
    const [logo] = await this.logoRepository.find({ order: { createdAt: 'DESC' }, take: 1 });
    return logo ?? null;
  }

  async findById(id: number): Promise<LogoEntity> {
    const logo = await this.logoRepository.findOne({ where: { id } });
    if (!logo) throw new NotFoundException('Logo not found');
    return logo;
  }

  async updateById(id: number, dto: UpdateLogoDto): Promise<LogoEntity> {
    const logo = await this.findById(id);
    if (dto.url !== undefined) logo.url = dto.url;
    if (dto.title !== undefined) logo.title = dto.title ?? null;
    return await this.logoRepository.save(logo);
  }

  async removeById(id: number): Promise<void> {
    const logo = await this.findById(id);
    await this.logoRepository.remove(logo);
  }

  async update(dto: UpdateLogoDto): Promise<LogoEntity> {
    const current = await this.getCurrent();
    if (dto.url !== undefined) current.url = dto.url;
    if (dto.title !== undefined) current.title = dto.title ?? null;
    return await this.logoRepository.save(current);
  }

  async remove(): Promise<void> {
    const current = await this.getCurrentOrNull();
    if (!current) return;
    await this.logoRepository.remove(current);
  }

  async upload(file: any, dto: UploadLogoDto): Promise<LogoEntity> {
    if (!file || !file.buffer) {
      throw new HttpException('Logo file is required', HttpStatus.BAD_REQUEST);
    }
    const key = this.generateObjectKey(file.originalname);
    const url = await this.s3.uploadObject({ key, body: file.buffer, contentType: file.mimetype });
    const logo = this.logoRepository.create({ url, title: dto.title ?? null });
    return await this.logoRepository.save(logo);
  }

  private generateObjectKey(originalName: string): string {
    const ext = originalName && originalName.includes('.') ? originalName.split('.').pop() : 'bin';
    const random = Math.random().toString(36).slice(2);
    const stamp = Date.now();
    return `uploads/logo/${stamp}-${random}.${ext}`;
  }
}
