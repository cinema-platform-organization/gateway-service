import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class TelegramFinalizeRequest {
	@ApiProperty({
		example: "21a0885dee191ae17d1842db2aa426ee",
	})
	@IsString()
	@IsNotEmpty()
	public sessionId: string;
}
