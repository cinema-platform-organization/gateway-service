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

	@ApiPropertyOptional({
		example:
			"https://cdn.cinema-platform.com/users/e0db4163fc2aab147599c750906396d3",
	})
	public avatar: string;
}
