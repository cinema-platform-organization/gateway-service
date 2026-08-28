import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class TelegramVerifyRequest {
	@ApiProperty({
		example:
			"eyJpZCI6NjE1NTg0Njk5MywiZmlyc3RfbmFtZSI6Ilx1MDQxMlx1MDQzMFx1MDQ...",
	})
	@IsString()
	@IsNotEmpty()
	public tgAuthResult: string;
}
