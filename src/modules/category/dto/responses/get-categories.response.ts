import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class GetCategoriesResponse {
	@ApiProperty({ example: "026f20c4-4826-4bea-b5e0-72ce8dda53d4" })
	public id: string;

	@ApiProperty({ example: "Action" })
	public title: string;

	@ApiPropertyOptional({ example: "action" })
	public slug?: string;
}
