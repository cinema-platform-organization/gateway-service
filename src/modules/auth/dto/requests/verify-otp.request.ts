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
	@ApiProperty({ example: "cinema-platform@gmail.com" })
	@IsString()
	@Validate(IdentifierValidator)
	public identifier: string;

	@ApiProperty({ example: "123456" })
	@IsNotEmpty()
	@IsNumberString()
	@Length(6, 6)
	public code: string;

	@ApiProperty({ example: "email", enum: ["phone", "email"] })
	@IsEnum(["phone", "email"])
	public type: "phone" | "email";
}
