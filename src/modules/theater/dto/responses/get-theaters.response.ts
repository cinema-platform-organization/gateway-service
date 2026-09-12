import { ApiProperty } from "@nestjs/swagger";

export class GetTheatersResponse {
	@ApiProperty({ example: "81lI6j9Ctva6e7oCPpelc" })
	public id: string;

	@ApiProperty({ example: "Cinema City" })
	public name: string;

	@ApiProperty({ example: "123 Main St, Kyiv" })
	public address: string;
}
