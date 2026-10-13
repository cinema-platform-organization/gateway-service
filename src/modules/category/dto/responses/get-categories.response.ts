import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class GetCategoriesResponse {
	@ApiProperty({
		description: "Category id",
		example: "026f20c4-4826-4bea-b5e0-72ce8dda53d4",
		format: "uuid",
	})
	public id: string;

	@ApiProperty({ description: "Display name", example: "Action" })
	public title: string;

	@ApiPropertyOptional({
		description:
			"URL-friendly identifier for `GET /movies?category=<slug>`. " +
			"Missing from the response if the category was created without one.",
		example: "action",
	})
	public slug?: string;
}
