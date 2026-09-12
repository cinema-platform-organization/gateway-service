import { ApiProperty } from "@nestjs/swagger";

export class GetHallResponse {
	@ApiProperty({ example: "tZwcb0sTC-0eiRZHm59r9" })
	public id: string;

	@ApiProperty({ example: "Hall 1" })
	public name: string;

	@ApiProperty({ example: "81lI6j9Ctva6e7oCPpelc" })
	public theaterId: string;
}
