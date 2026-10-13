import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, Matches } from "class-validator";

export class InitPhoneChangeRequest {
	@ApiProperty({
		description:
			"New phone number: 10–15 digits with an optional leading `+`, " +
			"no spaces or dashes. A 6-digit confirmation code is sent to it by SMS; " +
			"the account phone changes only after the code is confirmed. " +
			"Must not belong to another account.",
		example: "+380501234567",
		pattern: "^\\+?\\d{10,15}$",
	})
	@IsNotEmpty()
	@Matches(/^\+?\d{10,15}$/)
	public phone: string;
}
