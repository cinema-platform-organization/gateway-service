import { PassportModule } from "@cinema-platform/passport";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";

import { AccountModule } from "@/modules/account/account.module";
import { AuthModule } from "@/modules/auth/auth.module";
import { UsersModule } from "@/modules/users/users.module";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { getPassportConfig } from "./config";

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		PassportModule.registerAsync({
			useFactory: getPassportConfig,
			inject: [ConfigService],
		}),
		AuthModule,
		AccountModule,
		UsersModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
