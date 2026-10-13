import { ApiProperty } from "@nestjs/swagger";

export class GetTheatersResponse {
	@ApiProperty({
		description: "Theater id",
		example: "81lI6j9Ctva6e7oCPpelc",
	})
	public id: string;

	@ApiProperty({ description: "Theater name", example: "Cinema City" })
	public name: string;

	@ApiProperty({
		description: "Street address",
		example: "123 Main St, Kyiv",
	})
	public address: string;
}
