import { ApiProperty } from "@nestjs/swagger";

export class DeleteHallResponse {
	@ApiProperty({ example: true })
	public ok: boolean;
}
