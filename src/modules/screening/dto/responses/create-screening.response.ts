import { ApiProperty } from "@nestjs/swagger";

export class CreateScreeningResponse {
	@ApiProperty({ example: true })
	public ok: boolean;
}
