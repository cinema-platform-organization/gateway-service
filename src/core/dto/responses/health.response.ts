import { ApiProperty } from "@nestjs/swagger";

export class HealthResponse {
	@ApiProperty({ example: "ok" })
	public status: string;

	@ApiProperty({ example: "2023-03-01T00:00:00.000Z" })
	public timestamp: string;
}
