import { PartialType } from '@nestjs/mapped-types';
import { CreateSiteSettingDto } from './create-site-setting.dto';

export class UpdateSiteSettingDto extends PartialType(CreateSiteSettingDto) {}
