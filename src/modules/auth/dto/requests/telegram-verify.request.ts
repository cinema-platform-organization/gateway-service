import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class TelegramVerifyRequest {
	@ApiProperty({
		description:
			"Value of the `tgAuthResult` parameter that Telegram appends to the " +
			"`return_to` URL after login: base64-encoded JSON with the Telegram user " +
			"data and its `hash` signature. Pass it as is, without decoding.",
		example:
			"eyJpZCI6NjE1NTg0Njk5MywiZmlyc3RfbmFtZSI6Ilx1MDQxMlx1MDQzMFx1MDQ...",
	})
	@IsString()
	@IsNotEmpty()
	public tgAuthResult: string;
}
