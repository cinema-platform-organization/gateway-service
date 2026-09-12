import { ApiProperty } from "@nestjs/swagger";

export class PatchUserResponse {
	@ApiProperty({ example: true })
	public ok: boolean;
}
