import { Module } from '@nestjs/common';
import { LivreService } from './livre.service';
import { LivreController } from './livre.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from '../entity/book.entity';
import { HttpModule } from '@nestjs/axios';
import { Word } from 'src/entity/word.entity';

@Module({
  providers: [LivreService],
  controllers: [LivreController],
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([Book, Word])
  ]
})
export class LivreModule {}
