import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class InitEmailChangeRequest {
	@ApiProperty({
		example: "cinema-platform@mail.com",
	})
	@IsNotEmpty()
	@IsEmail()
	public email: string;
}
