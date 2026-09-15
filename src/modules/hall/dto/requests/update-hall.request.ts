import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateHallRequest {
	@ApiPropertyOptional({
		example: "Hall 1",
	})
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	public name?: string;
}
