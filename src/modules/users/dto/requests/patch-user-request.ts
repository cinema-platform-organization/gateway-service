import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class PatchUserRequest {
	@ApiProperty({
		example: "Someone",
	})
	@IsString()
	@IsNotEmpty()
	public name: string;
}
