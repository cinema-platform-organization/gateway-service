import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateHallRequest {
	@ApiPropertyOptional({
		description:
			"New hall name. Leave out to keep the current one. The seat layout " +
			"can't be changed after creation.",
		example: "Hall 1",
	})
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	public name?: string;
}
