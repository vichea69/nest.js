import {MiddlewareConsumer, Module, NestModule, RequestMethod} from "@nestjs/common";
import {UserController} from "./user.controller";
import {UserService} from "./user.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserEntity} from "./user.entity";
import {AuthMiddleware} from "./middlewares/auth.middleware";
import {JwtModule} from "@nestjs/jwt";
import { RolesGuard } from "./guards/roles.guard";

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity]),
        JwtModule.register({
            global: true,
            secret: process.env.JWT_SECRET as string,
            // Align with access token TTL used in UserService (15m)
            signOptions: {expiresIn: '1h'},
        }),],
    controllers: [UserController],
    providers: [UserService, RolesGuard],
    exports: [UserService]

})
export class UserModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AuthMiddleware).forRoutes({
            path: '*',
            method: RequestMethod.ALL
        });
    }
}
