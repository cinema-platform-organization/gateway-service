import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateCategoryRequest {
	@ApiPropertyOptional({ example: "Action" })
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	public title?: string;

	@ApiPropertyOptional({ example: "action" })
	@IsOptional()
	@IsString()
	public slug?: string;
}
