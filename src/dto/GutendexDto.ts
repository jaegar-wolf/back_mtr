import { Book } from "../entity/book.entity"

export interface GutendexDto{
    count: number,
    next: string | null,
    previous: string | null
    results: Array<BookInfo>
}

export interface BookInfo { 
    id: number
    title: string
    authors: Array<Author>
    translators: string[]
    subjects: string[]
    languages: string[]
    formats: Format
    download_count: number
}
export interface Format {
    "text/plain": string
    "application/x-mobipocket-ebook": string
    "text/html": string
    "application/octet-stream": string
    "text/plain; charset=us-ascii": string
    "application/epub+zip": string
    "image/jpeg": string
    "application/rdf+xml": string
    "text/plain; charset=utf-8": string | undefined
}
export interface Author {
    name: string,
    birth_year: number,
    death_year: number
}

export interface WordDto {
    word: string
}

export interface OccurenceDto {
    count: number,
    word: number,
    book: number
}