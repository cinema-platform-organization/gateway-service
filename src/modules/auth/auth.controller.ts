import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiOperation } from "@nestjs/swagger";

import { SendOtpRequest } from "./dto";

@Controller("auth")
export class AuthController {
	@ApiOperation({
		summary: "Send otp code",
		description:
			"Sends a verification code to the user's phone number or email.",
	})
	@Post("otp/send")
	@HttpCode(HttpStatus.OK)
	public async sendOtp(@Body() dto: SendOtpRequest) {
		return { ok: true };
	}
}
