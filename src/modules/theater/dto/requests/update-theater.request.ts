import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateTheaterRequest {
	@ApiPropertyOptional({
		example: "Aurora",
	})
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	public name?: string;

	@ApiPropertyOptional({
		example: "99 Kyiv St.",
	})
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	public address?: string;
}
