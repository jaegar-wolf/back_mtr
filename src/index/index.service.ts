import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Word } from '../entity/word.entity';
import { LivreService } from '../livre/livre.service';
import { Book } from 'src/entity/book.entity';
import { OccurenceDto, WordDto } from 'src/dto/GutendexDto';
import { Occurence } from 'src/entity/occurence.entity';

@Injectable()
export class IndexService {
    private readonly logger = new Logger(IndexService.name);

    //private API_URL = "https://mirror2.sandyriver.net/pub/gutenberg/"

    constructor(
      @InjectRepository(Word) 
      private wordRepository: Repository<Word>,

      @InjectRepository(Occurence)
      private occurRepository: Repository<Occurence>,

      private readonly httpService: HttpService,

      private livreService: LivreService
    ) {}
  
    async find(url: string): Promise<String[]> {
      const { data } = await firstValueFrom(
        this.httpService.get<String[]>(url).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error);
            throw 'An error happened!';
          }),
        ),
      ); 
      return data
    }

    async createIndex(){
      let books = await this.livreService.getBookForIndex()
      this.logger.log(books.length)
      const batchSize = 10; 

      const bookBatches: Book[][] = [];
      for (let i = 0; i < books.length; i += batchSize) {
        bookBatches.push(books.slice(i, i + batchSize));
      }
      
      let alreadySee = new Map<string,number>() 
      for(let books of bookBatches){
        for(let book of books) {
          const url = book.formats['text/plain; charset=us-ascii'] || book.formats['text/plain; charset=utf-8'] || book.formats['text/plain']
          if (url) {
            try {
              const text = await this.find(url)
              const arr = text.toString().replace(/\r?\n|\r| /g, " ").split(' ').filter(item => item !== "")
              const occurrenceMap = new Map<string, number>()
              for (let word of arr) {
                word = word.replace(/[\W_]+/g,"");
                if(word.length == 0) continue
                if (occurrenceMap.has(word)) {
                  occurrenceMap.set(word, occurrenceMap.get(word) + 1)
                } else {
                  occurrenceMap.set(word, 1)
                }
              }
              alreadySee = await this.createWordArray(occurrenceMap, book, alreadySee)
            }
            catch (error) {
                this.logger.error(`An error occurred while processing the book ${book.title}: ${error}`)
              }
          } else {
            this.logger.log(url)
            return
          }
        }
      }          
    }
    
    async createWordArray(map: Map<string, number>, book: Book, history: Map<string,number>){
      for(let [key, value] of map){
        if(history.has(key)) {
          let occur: OccurenceDto = {
            count: value,
            word: history.get(key),
            book: book.id
          } 
          await this.occurRepository.save(occur)
        } else {
          let mot: WordDto = {
            word: key
          } 
          this.wordRepository.save(mot).then(async newWord => {
            history.set(newWord.word, newWord.id)
            let occur: OccurenceDto = {
              count: value,
              word: newWord.id,
              book: book.id
            } 
            await this.occurRepository.save(occur)
          }).catch(() => {
            this.logger.error(mot, 'Duplicate Save')
          })
        }
      }

      return history
    }

}
