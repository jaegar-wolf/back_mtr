import { Author, Format } from "../dto/GutendexDto";
import { Entity, Column, PrimaryColumn, OneToMany } from "typeorm";
import { Word } from "./word.entity";
import { Occurence } from "./occurence.entity";

@Entity({ name: 'livre'})
export class Book{
    @PrimaryColumn()
    id: number;

    @Column({name: 'title', type: 'text'})
    title: string

    @Column({type:'jsonb', name: 'authors'})
    authors: Author[]

    @Column({name: 'subjects', type:'text', array: true })
    subjects: string[]

    @Column({name: 'languages', type: 'text', array: true})
    languages: string[]

    @Column({type:'jsonb', name: 'formats'})
    formats: Format

    @Column({name: 'download_count'})
    download_count: number
    
    @OneToMany(() => Occurence, occur => occur.book)
    occur: Occurence[]
}