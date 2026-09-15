import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateCategoryRequest {
	@ApiProperty({ example: "Action" })
	@IsString()
	@IsNotEmpty()
	public title: string;

	@ApiPropertyOptional({ example: "action" })
	@IsOptional()
	@IsString()
	public slug?: string;
}
