import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateTheaterRequest {
	@ApiPropertyOptional({
		description: "New theater name. Leave out to keep the current one.",
		example: "Aurora",
	})
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	public name?: string;

	@ApiPropertyOptional({
		description: "New street address. Leave out to keep the current one.",
		example: "99 Kyiv St.",
	})
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	public address?: string;
}
