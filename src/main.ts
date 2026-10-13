// sort-imports-ignore
import "./observability/tracing";

import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import cookieParser from "cookie-parser";
import { Logger } from "nestjs-pino";

import { AppModule } from "./core/app.module";
import { getCorsConfig } from "./core/config";
import { getValidationPipeConfig } from "./core/config";

import { GrpcExceptionFilter } from "./shared/filters";

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule, {
		bufferLogs: true,
	});

	const logger = app.get(Logger);
	app.useLogger(logger);

	const config = app.get(ConfigService);

	app.set("trust proxy", 1);

	app.use(cookieParser(config.getOrThrow<string>("COOKIES_SECRET")));
	app.useGlobalPipes(new ValidationPipe(getValidationPipeConfig()));
	app.useGlobalFilters(new GrpcExceptionFilter());
	app.enableCors(getCorsConfig(config));

	const swaggerConfig = new DocumentBuilder()
		.setTitle("Cinema Platform API")
		.setDescription("API Gateway for Cinema Platform microservices")
		.setVersion("1.0")
		.addBearerAuth()
		.addCookieAuth("refreshToken")
		.build();

	const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

	SwaggerModule.setup("/docs", app, swaggerDocument, {
		yamlDocumentUrl: "/openapi.yaml",
	});

	const port = config.getOrThrow<number>("HTTP_PORT");
	const host = config.getOrThrow<string>("HTTP_HOST");

	await app.listen(port);

	logger.log(`Gateway started: ${host}`);
	logger.log(`Gateway started: ${host}/docs`);
}
bootstrap();
