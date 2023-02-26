import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from 'src/entity/book.entity';
import { Occurence } from 'src/entity/occurence.entity';
import { Word } from 'src/entity/word.entity';
import { LivreModule } from 'src/livre/livre.module';
import { LivreService } from 'src/livre/livre.service';
import { IndexController } from './index.controller';
import { IndexService } from './index.service';

@Module({
  controllers: [IndexController],
  imports:[
    HttpModule,
    TypeOrmModule.forFeature([Book, Word, Occurence]),
    LivreModule
  ],
  providers: [IndexService, LivreService]
})
export class IndexModule {}
