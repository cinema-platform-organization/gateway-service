import { PassportModule } from "@cinema-platform/passport";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";

import { AccountModule } from "@/modules/account/account.module";
import { AuthModule } from "@/modules/auth/auth.module";
import { CategoryModule } from "@/modules/category/category.module";
import { HallModule } from "@/modules/hall/hall.module";
import { MediaModule } from "@/modules/media/media.module";
import { MovieModule } from "@/modules/movie/movie.module";
import { PaymentModule } from "@/modules/payment/payment.module";
import { ScreeningModule } from "@/modules/screening/screening.module";
import { SeatModule } from "@/modules/seat/seat.module";
import { TheaterModule } from "@/modules/theater/theater.module";
import { UsersModule } from "@/modules/users/users.module";
import { WebhookModule } from "@/modules/webhook/webhook.module";
import { ObservabilityModule } from "@/observability/observability.module";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { getPassportConfig } from "./config";

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: [
				`.env.${process.env.NODE_ENV}.local`,
				`.env.${process.env.NODE_ENV}`,
				".env",
			],
		}),
		PassportModule.registerAsync({
			useFactory: getPassportConfig,
			inject: [ConfigService],
		}),
		ObservabilityModule,
		AuthModule,
		AccountModule,
		UsersModule,
		MovieModule,
		CategoryModule,
		TheaterModule,
		HallModule,
		SeatModule,
		ScreeningModule,
		PaymentModule,
		WebhookModule,
		MediaModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
