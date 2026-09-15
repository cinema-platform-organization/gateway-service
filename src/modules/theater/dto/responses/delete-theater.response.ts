import { ApiProperty } from "@nestjs/swagger";

export class DeleteTheaterResponse {
	@ApiProperty({ example: true })
	public ok: boolean;
}
