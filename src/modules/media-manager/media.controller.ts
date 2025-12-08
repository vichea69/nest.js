import {Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UploadedFile, UseInterceptors} from "@nestjs/common";
import {FileInterceptor} from "@nestjs/platform-express";
import {MediaResponseInterface} from "@/modules/media-manager/types/media-response-interface";
import {MediaService} from "@/modules/media-manager/media.service";
import {MediasResponseInterface} from "@/modules/media-manager/types/medias-response-interface";


@Controller('media')
export class MediaController {
    constructor(private readonly mediaService: MediaService) {
    }

    //Get all Item in media
    @Get()
    findAll(): Promise<MediasResponseInterface> {
        return this.mediaService.findAll()
    }

    //Get by id
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.mediaService.findOne(id);
    }

    //Create media
    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    upload(
        @UploadedFile() file: Express.Multer.File,
    ): Promise<MediaResponseInterface> {
        return this.mediaService.upload(file);
    }

    //Update or edit
    @Put()
    update(): string {
        return "update Media Module"
    }

    //Delete something in media
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.mediaService.remove(id);
    }
}