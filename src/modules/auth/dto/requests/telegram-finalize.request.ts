import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class TelegramFinalizeRequest {
	@ApiProperty({
		description:
			'The `sessionId` query parameter of the "Return to website" link sent ' +
			"by the Telegram bot after the user shared their phone number " +
			"(32-character hex string). Valid for 2 minutes and usable once.",
		example: "21a0885dee191ae17d1842db2aa426ee",
	})
	@IsString()
	@IsNotEmpty()
	public sessionId: string;
}
