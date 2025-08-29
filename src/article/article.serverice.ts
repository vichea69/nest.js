import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { CreateArticleDto } from "./dto/createArticle.dto";
import { UpdateArticleDto } from "./dto/updateArticle.dto";
import { ArticleEntity } from "./article.entity";
import { UserEntity } from "@/user/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ArticleResponseInterface } from "./types/articleResponse.interface";
import { ArticlesResponseInterface } from "./types/articlesResponse.interface";
import slugify from 'slugify';

@Injectable()
export class ArticleService {
    constructor(
        @InjectRepository(ArticleEntity)
        private readonly articleRepository: Repository<ArticleEntity>,
    ) { }

    //get all articles
    async findAll(query: any): Promise<ArticlesResponseInterface> {
        const queryBuilder = this.articleRepository.createQueryBuilder('articles');
        queryBuilder.leftJoinAndSelect('articles.author', 'author');

        // Optional filtering by tag
        if (query.tag) {
            queryBuilder.andWhere(':tag = ANY(string_to_array(articles.tagList, ","))', { tag: String(query.tag) });
        }

        // Removed favorited filter since favorites relation is removed

        // Pagination
        const limit = Math.min(Number(query.limit) || 20, 50);
        const offset = Number(query.offset) || 0;
        queryBuilder.take(limit).skip(offset);

        const [articles, articlesCount] = await Promise.all([
            queryBuilder.getMany(),
            queryBuilder.getCount(),
        ]);

        return { articles, articlesCount };
    }
    //create article
    async createArticle(user: UserEntity, createArticleDto: CreateArticleDto): Promise<ArticleEntity> {
        const article = new ArticleEntity();
        Object.assign(article, createArticleDto);
        if (!article.tagList) {
            article.tagList = [];
        }
        article.slug = this.generateSlug(article.title);
        article.author = user;

        return await this.articleRepository.save(article);
    }

    async getSingleArticle(slug: string): Promise<ArticleEntity> {
        const article = await this.articleRepository.findOne({
            where: {
                slug: slug
            }
        });
        if (!article) {
            throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
        }
        return article;
    }
    //find article by slug
    async findBySlug(slug: string): Promise<ArticleEntity> {
        const article = await this.articleRepository.findOne({
            where: {
                slug: slug
            }
        });
        if (!article) {
            throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
        }
        return article;
    }
    //delete article
    async deleteArticle(slug: string, currentUserId: number): Promise<void> {
        const article = await this.findBySlug(slug);
        if (article.authorId !== currentUserId) {
            throw new HttpException('You are not the author of this article', HttpStatus.FORBIDDEN);
        }
        await this.articleRepository.delete({ slug });
    }

    generateSlug(title: string): string {
        if (!title || typeof title !== 'string' || title.trim().length === 0) {
            throw new Error('Invalid article title for slug generation');
        }
        const id = Date.now().toString(36) + Math.random().toString(36).substring(2);
        return `${slugify(title, { lower: true, strict: true, trim: true })}-${id}`;
    }

    getArticleResponse(article: ArticleEntity): ArticleResponseInterface {
        return { article };
    }
    //update article
    async updateArticle(slug: string, currentUserId: number, updateDto: UpdateArticleDto): Promise<ArticleEntity> {
        const article = await this.findBySlug(slug);
        if (article.authorId !== currentUserId) {
            throw new HttpException('You are not the author of this article', HttpStatus.FORBIDDEN);
        }

        const isTitleChanging = typeof updateDto.title === 'string' && updateDto.title.trim().length > 0 && updateDto.title !== article.title;

        Object.assign(article, updateDto);

        if (isTitleChanging) {
            article.slug = this.generateSlug(article.title);
        }

        if (!article.tagList) {
            article.tagList = [];
        }

        return await this.articleRepository.save(article);
    }
    // Favorite-related features removed
}
