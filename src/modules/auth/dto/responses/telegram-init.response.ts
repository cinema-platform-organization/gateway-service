import { ApiProperty } from "@nestjs/swagger";

export class TelegramInitResponse {
	@ApiProperty({
		example:
			"https://oauth.telegram.org/auth?bot_id=123456789&origin=https%3A%2F%2Fcinema-platform.site&request_access=write&return_to=https%3A%2F%2Fcinema-platform.site",
	})
	public url: string;
}
