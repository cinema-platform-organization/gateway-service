import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateCategoryRequest {
	@ApiPropertyOptional({
		description: "New display name. Leave out to keep the current one.",
		example: "Action",
		maxLength: 255,
	})
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	@MaxLength(255)
	public title?: string;

	@ApiPropertyOptional({
		description:
			"New URL-friendly identifier, must be unique across categories. " +
			"Leave out to keep the current one. Avoid `now`, `soon` and `all` " +
			"(special values of the movie filter).",
		example: "action",
		maxLength: 255,
	})
	@IsOptional()
	@IsString()
	@MaxLength(255)
	public slug?: string;
}
