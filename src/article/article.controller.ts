import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { CreateArticleDto } from "./dto/createArticle.dto";
import { ArticleService } from "./article.serverice";
import { UserEntity } from "@/user/user.entity";
import { User } from "@/user/decorators/user.decorator";
import { AuthGuard } from "@/user/guards/auth.guard";

@Controller()
export class ArticleController {
    constructor(private readonly articleService: ArticleService) { }

    //get all articles
    @Get('articles')
    async getArticles(@Query() query: any) {
        return await this.articleService.findAll(query);
    }

    //get article by slug
    @Get('articles/:slug')
    async getArticleBySlug(@Param('slug') slug: string) {
        const article = await this.articleService.getSingleArticle(slug);
        return this.articleService.getArticleResponse(article);
    }
    //create article
    @Post('articles')
    @UseGuards(AuthGuard)
    async createArticle(@Body('article') createArticleDto: CreateArticleDto, @User() user: UserEntity) {
        const newArticle = await this.articleService.createArticle(user, createArticleDto);
        return this.articleService.getArticleResponse(newArticle);
    }
    //delete article
    @Delete('articles/:slug')
    @UseGuards(AuthGuard)
    async deleteArticle(@Param('slug') slug: string, @User() user: UserEntity) {
        const currentUserId = user.id;
        await this.articleService.deleteArticle(slug, currentUserId);
        return {
            message: 'Article deleted successfully'
        };
    }
    //update article
    @Put('articles/:slug')
    @UseGuards(AuthGuard)
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
    async updateArticle(
        @Param('slug') slug: string,
        @Body('article') updateDto: any,
        @User() user: UserEntity,
    ) {
        const updated = await this.articleService.updateArticle(slug, user.id, updateDto);
        return this.articleService.getArticleResponse(updated);
    }
    // add to favorite article
    @Post('articles/:slug/favorite')
    @UseGuards(AuthGuard)
    async addToFavoriteArticle(@Param('slug') slug: string, @User() user: UserEntity) {
        const article = await this.articleService.addToFavoriteArticle(slug, user.id);
        return this.articleService.getArticleResponse(article);
    }

    // remove from favorite article
    @Delete('articles/:slug/favorite')
    @UseGuards(AuthGuard)
    async removeFromFavoriteArticle(@Param('slug') slug: string, @User() user: UserEntity) {
        const article = await this.articleService.removeFromFavoriteArticle(slug, user.id);
        return this.articleService.getArticleResponse(article);
    }

    // get current user's favorite articles
    @Get('articles/favorites')
    @UseGuards(AuthGuard)
    async getMyFavoriteArticles(@User() user: UserEntity, @Query() query: any) {
        return await this.articleService.findFavoritesByUser(user.id, query);
    }

}