import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateCategoryRequest {
	@ApiProperty({
		description: "Display name of the category",
		example: "Action",
		maxLength: 255,
	})
	@IsString()
	@IsNotEmpty()
	@MaxLength(255)
	public title: string;

	@ApiPropertyOptional({
		description:
			"URL-friendly identifier, used to filter movies with `GET /movies?category=<slug>`. " +
			"Must be unique across categories. Not generated automatically: without it " +
			"the category cannot be used in the movie filter. Avoid `now`, `soon` and " +
			"`all` — the movie filter treats them as special values, not as slugs.",
		example: "action",
		maxLength: 255,
	})
	@IsOptional()
	@IsString()
	@MaxLength(255)
	public slug?: string;
}
