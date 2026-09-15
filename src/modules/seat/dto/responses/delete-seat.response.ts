import { ApiProperty } from "@nestjs/swagger";

export class DeleteSeatResponse {
	@ApiProperty({ example: true })
	public ok: boolean;
}
