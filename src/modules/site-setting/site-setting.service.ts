import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SiteSettingEntity } from '@/modules/site-setting/site-setting.entity';
import { CreateSiteSettingDto } from '@/modules/site-setting/dto/create-site-setting.dto';
import { UpdateSiteSettingDto } from '@/modules/site-setting/dto/update-site-setting.dto';
import { R2Service } from '@/modules/site-setting/r2.service';
import { UploadedFilePayload } from '@/types/uploaded-file.type';

@Injectable()
export class SiteSettingService {
  constructor(
    @InjectRepository(SiteSettingEntity)
    private readonly siteSettingRepository: Repository<SiteSettingEntity>,
    private readonly r2: R2Service,
  ) {}

  async create(dto: CreateSiteSettingDto, file?: UploadedFilePayload | null): Promise<SiteSettingEntity> {
    const siteSetting = this.siteSettingRepository.create(dto);
    if (file?.buffer) {
      siteSetting.siteLogo = await this.uploadLogo(file);
    }
    return await this.siteSettingRepository.save(siteSetting);
  }

  async findAll(): Promise<SiteSettingEntity[]> {
    return await this.siteSettingRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: number): Promise<SiteSettingEntity> {
    const siteSetting = await this.siteSettingRepository.findOne({ where: { id } });
    if (!siteSetting) {
      throw new NotFoundException('Site setting not found');
    }
    return siteSetting;
  }

  async update(
    id: number,
    dto: UpdateSiteSettingDto,
    file?: UploadedFilePayload | null,
  ): Promise<SiteSettingEntity> {
    const siteSetting = await this.findOne(id);
    Object.assign(siteSetting, dto);
    if (file?.buffer) {
      siteSetting.siteLogo = await this.uploadLogo(file);
    }
    return await this.siteSettingRepository.save(siteSetting);
  }

  async remove(id: number): Promise<void> {
    const siteSetting = await this.findOne(id);
    await this.siteSettingRepository.remove(siteSetting);
  }

  private async uploadLogo(file: UploadedFilePayload): Promise<string> {
    const key = this.generateObjectKey(file.originalname);
    return await this.r2.uploadObject({ key, body: file.buffer, contentType: file.mimetype });
  }

  private generateObjectKey(originalName: string): string {
    const ext = originalName && originalName.includes('.') ? originalName.split('.').pop() : 'bin';
    const random = Math.random().toString(36).slice(2);
    const stamp = Date.now();
    return `uploads/site-settings/${stamp}-${random}.${ext}`;
  }
}
