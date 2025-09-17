import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { CreateArticleDto } from "./dto/createArticle.dto";
import { ArticleService } from "./article.serverice";
import { UserEntity } from "@/modules/users/entities/user.entity";
import { User } from "@/modules/auth/decorators/user.decorator";
import { AuthGuard } from "@/modules/auth/guards/auth.guard";
import { Roles } from "@/modules/auth/decorators/roles.decorator";
import { RolesGuard } from "@/modules/auth/guards/roles.guard";
import { Role } from "@/modules/auth/enums/role.enum";

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
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Admin, Role.Editor)
    async createArticle(@Body('article') createArticleDto: CreateArticleDto, @User() user: UserEntity) {
        const newArticle = await this.articleService.createArticle(user, createArticleDto);
        return this.articleService.getArticleResponse(newArticle);
    }
    //delete article
    @Delete('articles/:slug')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Admin, Role.Editor)
    async deleteArticle(@Param('slug') slug: string, @User() user: UserEntity) {
        const currentUserId = user.id;
        await this.articleService.deleteArticle(slug, currentUserId);
        return {
            message: 'Article deleted successfully'
        };
    }
    //update article
    @Put('articles/:slug')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Admin, Role.Editor)
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
    async updateArticle(
        @Param('slug') slug: string,
        @Body('article') updateDto: any,
        @User() user: UserEntity,
    ) {
        const updated = await this.articleService.updateArticle(slug, user.id, updateDto);
        return this.articleService.getArticleResponse(updated);
    }
    // Favorite-related routes removed

}
