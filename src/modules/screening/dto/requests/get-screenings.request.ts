import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsISO8601, IsOptional, IsString } from "class-validator";

export class GetScreeningsRequest {
	@ApiPropertyOptional({
		example: "81lI6j9Ctva6e7oCPpelc",
	})
	@IsOptional()
	@IsString()
	public theaterId?: string;

	@ApiPropertyOptional({
		example: "2025-11-08",
	})
	@IsOptional()
	@IsISO8601()
	public date?: string;
}
