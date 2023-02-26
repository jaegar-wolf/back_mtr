import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Book } from "./book.entity";
import { Word } from "./word.entity";


@Entity({name: 'occurence'})
export class Occurence {
    @PrimaryGeneratedColumn()
    id: number

    @Column({name: 'count'})
    count: number

    @ManyToOne(() => Word, word => word.id)
    word: number

    @ManyToOne(() => Book, book => book.id)
    book: number
}