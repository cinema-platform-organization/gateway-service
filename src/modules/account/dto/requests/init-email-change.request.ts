import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class InitEmailChangeRequest {
	@ApiProperty({
		example: "email@mail.cinema-platform.site",
	})
	@IsNotEmpty()
	@IsEmail()
	public email: string;
}
