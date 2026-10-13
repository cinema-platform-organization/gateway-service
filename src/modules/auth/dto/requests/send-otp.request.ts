import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsString, Validate } from "class-validator";

import { IdentifierValidator } from "@/shared/validators";

export class SendOtpRequest {
	@ApiProperty({
		description:
			"Where to send the code. Must match `type`:\n" +
			"- `email` — a valid email address\n" +
			"- `phone` — 10–15 digits with an optional leading `+`, no spaces or dashes\n\n" +
			"If no account exists for this identifier yet, one is created.",
		example: "cinema-platform@gmail.com",
	})
	@IsString()
	@Validate(IdentifierValidator)
	public identifier: string;

	@ApiProperty({
		description:
			"Delivery channel: `email` sends the code by email, `phone` by SMS. " +
			"Also decides how `identifier` is validated.",
		example: "email",
		enum: ["phone", "email"],
	})
	@IsEnum(["phone", "email"])
	public type: "phone" | "email";
}
