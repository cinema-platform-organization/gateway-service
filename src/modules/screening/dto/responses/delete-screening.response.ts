import { ApiProperty } from "@nestjs/swagger";

export class DeleteScreeningResponse {
	@ApiProperty({ example: true })
	public ok: boolean;
}
