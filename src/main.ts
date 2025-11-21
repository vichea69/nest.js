import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";


async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.enableCors({
		origin: process.env.FRONTEND_URL,
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization'],
	});
	app.use(cookieParser());
	app.setGlobalPrefix('api/v1')

	// Swagger/OpenAPI setup
	const swaggerConfig = new DocumentBuilder()
		.setTitle('API Documentation')
		.setDescription('REST API documentation')
		.setVersion('1.0')
		.addBearerAuth(
			{
				type: 'http',
				scheme: 'bearer',
				bearerFormat: 'JWT',
				in: 'header',
			},
			'bearer',
		)
		.build();

	const document = SwaggerModule.createDocument(app, swaggerConfig, {
		ignoreGlobalPrefix: false,
	});
	SwaggerModule.setup('api/v1/docs', app, document, {
		swaggerOptions: { persistAuthorization: true },
	});

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,

		}),
	);
	app.useGlobalInterceptors(new ResponseInterceptor());
	app.useGlobalFilters(new AllExceptionsFilter());
	await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
