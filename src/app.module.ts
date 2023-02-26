import { Module } from '@nestjs/common';
import { IndexModule } from './index/index.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LivreModule } from './livre/livre.module';
import { Book } from './entity/book.entity';
import { Occurence } from './entity/occurence.entity';
import { Word } from './entity/word.entity';

@Module({
  imports: [
    IndexModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'MTRB',
      entities: [Book, Occurence, Word],
      synchronize: true,
      autoLoadEntities: true,
      logging: false
    }),
    LivreModule
  ],
})
export class AppModule {}
