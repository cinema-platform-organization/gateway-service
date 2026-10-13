import { ApiProperty } from "@nestjs/swagger";
import {
	IsEnum,
	IsNotEmpty,
	IsNumberString,
	IsString,
	Length,
	Validate,
} from "class-validator";

import { IdentifierValidator } from "@/shared/validators";

export class VerifyOtpRequest {
	@ApiProperty({
		description:
			"The same email or phone number the code was sent to with /auth/otp/send. " +
			"Validated against `type` the same way.",
		example: "cinema-platform@gmail.com",
	})
	@IsString()
	@Validate(IdentifierValidator)
	public identifier: string;

	@ApiProperty({
		description:
			"6-digit code from the email or SMS. Valid for 5 minutes and usable once; " +
			"requesting a new code replaces the previous one.",
		example: "123456",
		minLength: 6,
		maxLength: 6,
		pattern: "^\\d{6}$",
	})
	@IsNotEmpty()
	@IsNumberString()
	@Length(6, 6)
	public code: string;

	@ApiProperty({
		description: "The same `type` that was used with /auth/otp/send.",
		example: "email",
		enum: ["phone", "email"],
	})
	@IsEnum(["phone", "email"])
	public type: "phone" | "email";
}
