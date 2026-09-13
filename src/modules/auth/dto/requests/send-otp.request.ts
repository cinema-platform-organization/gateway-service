import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsString, Validate } from "class-validator";

import { IdentifierValidator } from "@/shared/validators";

export class SendOtpRequest {
	@ApiProperty({ example: "cinema-platform@gmail.com" })
	@IsString()
	@Validate(IdentifierValidator)
	public identifier: string;

	@ApiProperty({ example: "email", enum: ["phone", "email"] })
	@IsEnum(["phone", "email"])
	public type: "phone" | "email";
}
