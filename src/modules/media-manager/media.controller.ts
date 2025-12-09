import {Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UploadedFiles, UseInterceptors} from "@nestjs/common";
import {FilesInterceptor} from "@nestjs/platform-express";
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
    @UseInterceptors(FilesInterceptor('files', 20))
    upload(@UploadedFiles() files: Express.Multer.File[]) {
        return this.mediaService.upload(files);
    }

    //Replace Media
    @Put(':id/replace')
    @UseInterceptors(FilesInterceptor('files', 1))
    replace(
        @Param('id', ParseIntPipe) id: number,
        @UploadedFiles() files: Express.Multer.File[],
    ) {
        return this.mediaService.replace(id, files[0]);
    }


    //Delete something in media
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.mediaService.remove(id);
    }
}