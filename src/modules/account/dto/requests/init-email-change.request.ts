import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class InitEmailChangeRequest {
	@ApiProperty({
		description:
			"New email address. A 6-digit confirmation code is sent to it; " +
			"the account email changes only after the code is confirmed. " +
			"Must not belong to another account.",
		example: "email@mail.cinema-platform.site",
		format: "email",
	})
	@IsNotEmpty()
	@IsEmail()
	public email: string;
}
