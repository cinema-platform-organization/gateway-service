import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumberString, Length, Matches } from "class-validator";

export class ConfirmPhoneChangeRequest {
	@ApiProperty({
		example: "+1234567890",
	})
	@IsNotEmpty()
	@Matches(/^\+?\d{10,15}$/)
	public phone: string;

	@ApiProperty({ example: "123456" })
	@IsNotEmpty()
	@IsNumberString()
	@Length(6, 6)
	public code: string;
}
