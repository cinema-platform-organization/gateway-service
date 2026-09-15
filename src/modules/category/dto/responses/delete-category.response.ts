import { ApiProperty } from "@nestjs/swagger";

export class DeleteCategoryResponse {
	@ApiProperty({ example: true })
	public ok: boolean;
}
