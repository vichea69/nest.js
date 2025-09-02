import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UploadLogoDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  title: string;
}


