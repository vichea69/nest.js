import {Controller, Delete, Get, Post, Put} from "@nestjs/common";


@Controller('media')
export class MediaController {

    //Get all Item in media
    @Get()
    findAll(): string {
        return "This is Media Module 🔥"
    }

    //Get by id
    @Get(':id')
    findOne(): string {
        return "This is Media Module 🔥"
    }

    //Create media
    @Post()
    create(): string {
        return "Create Media Module"
    }

    //Update or edit
    @Put()
    update(): string {
        return "update Media Module"
    }

    //Delete something in media
    @Delete()
    remove(): string {
        return "Delete Media Module"
    }
}