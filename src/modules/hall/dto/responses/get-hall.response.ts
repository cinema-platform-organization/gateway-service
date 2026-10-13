import { ApiProperty } from "@nestjs/swagger";

export class GetHallResponse {
	@ApiProperty({ description: "Hall id", example: "tZwcb0sTC-0eiRZHm59r9" })
	public id: string;

	@ApiProperty({ description: "Hall name", example: "Hall 1" })
	public name: string;

	@ApiProperty({
		description: "Id of the theater the hall belongs to",
		example: "81lI6j9Ctva6e7oCPpelc",
	})
	public theaterId: string;
}
