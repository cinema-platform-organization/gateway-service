import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class GetMeResponse {
	@ApiProperty({
		description: "User id (the same as the account id)",
		example: "X6KBMTnCDkbrPN_I0YXG8",
	})
	public id: string;

	@ApiPropertyOptional({
		description: "Display name. Missing until the user sets one.",
		example: "Someone",
	})
	public name: string;

	@ApiProperty({
		description:
			"Email address. Missing if the user signed up with a phone number or " +
			"Telegram and never added an email.",
		example: "email@mail.cinema-platform.site",
	})
	public email: string;

	@ApiProperty({
		description:
			"Phone number. Missing if the user signed up with email and never added a phone.",
		example: "+380501234567",
	})
	public phone: string;

	@ApiPropertyOptional({
		description:
			"Path of the avatar file in media storage (relative, not a full URL). " +
			"Missing until the user uploads one.",
		example: "users/2ee7cf301d876120f24a7592c325f7d3",
	})
	public avatar?: string;

	@ApiProperty({
		description: "Account role. `ADMIN` can use the admin-only endpoints.",
		example: "USER",
		enum: ["USER", "ADMIN"],
	})
	public role: "USER" | "ADMIN";
}
