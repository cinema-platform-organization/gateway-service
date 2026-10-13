import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsNumberString, Length } from "class-validator";

export class ConfirmEmailChangeRequest {
	@ApiProperty({
		description:
			"The same new email address that was sent to /account/email/init. " +
			"A different address is rejected with 400 Email mismatch.",
		example: "email@mail.cinema-platform.site",
		format: "email",
	})
	@IsNotEmpty()
	@IsEmail()
	public email: string;

	@ApiProperty({
		description:
			"6-digit confirmation code received at the new email address. " +
			"Valid for 5 minutes and usable once.",
		example: "123456",
		minLength: 6,
		maxLength: 6,
		pattern: "^\\d{6}$",
	})
	@IsNotEmpty()
	@IsNumberString()
	@Length(6, 6)
	public code: string;
}
