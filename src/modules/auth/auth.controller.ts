import {
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	Post,
	Req,
	Res,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApiOperation } from "@nestjs/swagger";
import type { Request, Response } from "express";
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

	@ApiOperation({
		summary: "Refresh access token",
		description: "Renews access token using refresh token from cookies.",
	})
	@Post("refresh")
	@HttpCode(HttpStatus.OK)
	public async refresh(
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response,
	) {
		const refreshToken = req.cookies?.refreshToken as string;

		const { accessToken, refreshToken: newRefreshToken } =
			await lastValueFrom(this.client.refresh({ refreshToken }));

		res.cookie("refreshToken", newRefreshToken, {
			httpOnly: true,
			secure: this.configService.get("NODE_ENV") !== "development",
			domain: this.configService.getOrThrow<string>("COOKIES_DOMAIN"),
			sameSite: "lax",
			maxAge: 30 * 24 * 60 * 60 * 1000,
		});

		return { accessToken };
	}

	@ApiOperation({
		summary: "Logout",
		description: "Clears the refresh token cookie and logs the user out",
	})
	@Post("logout")
	@HttpCode(HttpStatus.OK)
	public async logout(@Res({ passthrough: true }) res: Response) {
		res.cookie("refreshToken", "", {
			httpOnly: true,
			secure: this.configService.get("NODE_ENV") !== "development",
			domain: this.configService.getOrThrow<string>("COOKIES_DOMAIN"),
			sameSite: "lax",
			expires: new Date(0),
		});

		return { ok: true };
	}
}
