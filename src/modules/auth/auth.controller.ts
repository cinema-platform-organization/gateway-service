import {
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	Post,
	Res,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApiOperation } from "@nestjs/swagger";
import type { Response } from "express";
import { lastValueFrom } from "rxjs";

import { AuthClientGrpc } from "./auth.grpc";
import { SendOtpRequest, VerifyOtpRequest } from "./dto";

@Controller("auth")
export class AuthController {
	public constructor(
		private readonly client: AuthClientGrpc,
		private readonly configService: ConfigService,
	) {}

	@ApiOperation({
		summary: "Send otp code",
		description:
			"Sends a verification code to the user's phone number or email.",
	})
	@Post("otp/send")
	@HttpCode(HttpStatus.OK)
	public async sendOtp(@Body() dto: SendOtpRequest) {
		return this.client.sendOtp(dto);
	}

	@ApiOperation({
		summary: "Verify otp code",
		description:
			"Verifies the code sent to the user phone number or email and returns an access token.",
	})
	@Post("otp/verify")
	@HttpCode(HttpStatus.OK)
	public async verifyOtp(
		@Body() dto: VerifyOtpRequest,
		@Res({ passthrough: true }) res: Response,
	) {
		const { accessToken, refreshToken } = await lastValueFrom(
			this.client.verifyOtp(dto),
		);

		res.cookie("refreshToken", refreshToken, {
			httpOnly: true,
			secure:
				this.configService.get<string>("NODE_ENV") !== "development",
			domain: this.configService.getOrThrow<string>("COOKIES_DOMAIN"),
			sameSite: "lax",
			maxAge: 30 * 24 * 60 * 60 * 1000,
		});

		return { accessToken };
	}
}
