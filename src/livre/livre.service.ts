import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { all, AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { BookInfo, GutendexDto } from 'src/dto/GutendexDto';
import { Book } from 'src/entity/book.entity';
import { Occurence } from 'src/entity/occurence.entity';
import { Word } from 'src/entity/word.entity';
import { Repository } from 'typeorm';
import { jaccard } from 'wuzzy';

@Injectable()
export class LivreService {
    
  private readonly logger = new Logger(LivreService.name);
  constructor(
      @InjectRepository(Book)
      private bookRepository: Repository<Book>,

      @InjectRepository(Word)
      private wordRepository: Repository<Word>,

      private readonly httpService: HttpService
  ){}

  private async allBooks(): Promise<BookInfo[]> {
      const books: BookInfo[] = [];
      let page = 1;
      while (page < 61) {
          const { data } = await firstValueFrom(
              this.httpService.get<GutendexDto>(`https://gutendex.com/books/?page=${page}`).pipe(
                catchError((error: AxiosError) => {
                  this.logger.error(error.response.data);
                  throw 'An error happened!';
                }),
              ),
          );
          data.results.map( book => {
            books.push(book)
          })
          if (!data.next) {
              break;
          }
          page++;
      }
      return books;
  }

  async createBook(){
    const books = await this.allBooks();
    const entities = books.map(book => this.bookRepository.create(book));
    return this.bookRepository.save(entities);
  }

  async getBookForIndex(){
    return await this.bookRepository.find()
  }

  async getBook(){
    return await this.bookRepository.find({ take: 1000})
  }

  async findBookByWord(theWord: string){
    const books = await this.bookRepository
      .createQueryBuilder("book")
      .select(['book.id', 'book.title', 'book.authors', 'book.formats', 'book.subjects'])
      .leftJoin(Occurence, "occur", "book.id = occur.book")
      .leftJoin(Word, "word", "occur.word = word.id")
      .where("word.word = :mot", { mot: theWord } )
      .orderBy("occur.count", "DESC")
      .getMany()

    return await this.sortWithJaccard(books)
  }

  async findBookByRegex(reg: string){
    let words = await this.wordRepository.find()
    const regex = new RegExp(reg,"gmi")
    words = words.filter(word => regex.test(word.word))
    const onlyWord = words.map(word => word.word)
    const books =  await this.bookRepository
      .createQueryBuilder("book")
      .select(['book.id', 'book.title', 'book.authors', 'book.formats', 'book.subjects'])
      .leftJoin(Occurence, "occur", "book.id = occur.book")
      .leftJoin(Word, "word", "occur.word = word.id")
      .where("word.word in (:...mots)", { mots: onlyWord } )
      .orderBy("occur.count", "DESC")
      .getMany()

    return await this.sortWithJaccard(books)
  }

  private async sortWithJaccard(books: Book[]){ 
    if (books.length == 0) {
      return []
    }
    else {
      const jaccardMap = new Map<Book, number>()
      const blackList = await this.getBlackListWord()
      const firstBook = books.shift()
      const secondBook = books.shift()
      let firstBookWords = await this.getWordsOfBookFiltered(firstBook, blackList)
      for(let book of books) {
        const bookWords = await this.getWordsOfBookFiltered(book, blackList)
        jaccardMap.set(book, jaccard(firstBookWords,bookWords))
      }
      const sortByJaccard = Array.from(jaccardMap.entries()).sort((a,b) => {
        return b[1] - a[1]
      })
      let newBookList = sortByJaccard.map( e => e[0])
      newBookList.unshift(secondBook)
      newBookList.unshift(firstBook)
      return newBookList
    }

  }

  private async getWordsOfBookFiltered(book: Book, blackList: string[]){
    const words = await this.wordRepository
    .createQueryBuilder("word")
    .leftJoin(Occurence, "occur", "word.id = occur.word")
    .leftJoin(Book, "book", "book.id = occur.book")
    .where("book.id = :id", { id: book.id})
    .getMany()

    const toFilter =  words.map(word => word.word.toLowerCase())
    return toFilter.filter(word => !blackList.includes(word))
  }

  private async getBlackListWord(){
    const blackList = await this.wordRepository
        .createQueryBuilder("word")
        .select("word.word")
        .addSelect("SUM(occur.count)", "sum")
        .leftJoin(Occurence, "occur", "word.id = occur.word")
        .groupBy("word.id, word.word")
        .having("SUM(occur.count) > 3000")
        .orderBy("sum", "DESC")
        .getMany()

    return blackList.map(word => word.word)
  }
}

