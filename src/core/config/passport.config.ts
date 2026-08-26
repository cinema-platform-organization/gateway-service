import { PassportOptions } from "@cinema-platform/passport";
import { ConfigService } from "@nestjs/config";

export function getPassportConfig(
	configService: ConfigService,
): PassportOptions {
	return {
		secretKey: configService.getOrThrow<string>("PASSPORT_SECRET_KEY"),
	};
}
