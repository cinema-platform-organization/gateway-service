import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class GetMeResponse {
	@ApiProperty({
		example: "X6KBMTnCDkbrPN_I0YXG8",
	})
	public id: string;

	@ApiPropertyOptional({
		example: "Someone",
	})
	public name: string;

	@ApiProperty({
		example: "someone@cinema-platform.com",
	})
	public email: string;

	@ApiProperty({
		example: "+1234567890",
	})
	public phone: string;

	@ApiPropertyOptional({ example: "users/2ee7cf301d876120f24a7592c325f7d3" })
	public avatar?: string;

	@ApiProperty({
		example: "USER",
		enum: ["USER", "ADMIN"],
	})
	public role: "USER" | "ADMIN";
}
