import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class PatchUserRequest {
	@ApiProperty({
		description:
			"New display name. Email and phone are changed through /account, " +
			"the avatar through PATCH /users/@me/avatar.",
		example: "Someone",
	})
	@IsString()
	@IsNotEmpty()
	public name: string;
}
