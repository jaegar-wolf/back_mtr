import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { LivreService } from './livre.service';

@Controller('livre')
export class LivreController {
    constructor(private livreService: LivreService){}

    private async getAllBooks(){
        return await this.livreService.createBook()
    }

    @Get('/all')
    async getBook(){
        return await this.livreService.getBook()
    }

    @Get('/byWord/:mot')
    async findBook(@Param('mot') mot: string){
        return await this.livreService.findBookByWord(mot)
    }

    @Post('/regex')
    async findByRegex(@Body('reg') reg: string){
        return await this.livreService.findBookByRegex(reg)
    }
}
