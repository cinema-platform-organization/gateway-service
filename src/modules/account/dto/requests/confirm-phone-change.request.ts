import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumberString, Length, Matches } from "class-validator";

export class ConfirmPhoneChangeRequest {
	@ApiProperty({
		description:
			"The same new phone number that was sent to /account/phone/init. " +
			"A different number is rejected with 400 Phone mismatch.",
		example: "+380501234567",
		pattern: "^\\+?\\d{10,15}$",
	})
	@IsNotEmpty()
	@Matches(/^\+?\d{10,15}$/)
	public phone: string;

	@ApiProperty({
		description:
			"6-digit confirmation code received by SMS. " +
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
