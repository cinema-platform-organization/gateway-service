import { ApiProperty } from "@nestjs/swagger";

export class TelegramInitResponse {
	@ApiProperty({
		description:
			"URL to send the user to next:\n" +
			"- from GET /auth/telegram — the Telegram OAuth page; after login Telegram " +
			"redirects back with `tgAuthResult` for POST /auth/telegram/verify\n" +
			"- from POST /auth/telegram/verify — a `https://t.me/<bot>?start=<sessionId>` " +
			"link to the bot, where the user shares their phone number to finish signing up",
		example:
			"https://oauth.telegram.org/auth?bot_id=123456789&origin=https%3A%2F%2Fcinema-platform.site&request_access=write&return_to=https%3A%2F%2Fcinema-platform.site",
		format: "uri",
	})
	public url: string;
}
