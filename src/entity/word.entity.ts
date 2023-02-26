import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Book } from "./book.entity";
import { Occurence } from "./occurence.entity";

@Entity({name: 'word'})
export class Word {
    @PrimaryGeneratedColumn()
    id: number

    @Column({name: 'lib_word', unique: true})
    word: string

    @OneToMany(() => Occurence, occur => occur.id)
    occurence: Occurence[]
}