import { Controller, Get } from '@nestjs/common';
import { IndexService } from './index.service';

@Controller('index')
export class IndexController {

    constructor(private indexService: IndexService){}

    //@Get()
    private async getFile() {
        return await this.indexService.createIndex()
      }
}
