import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Post,
	Req,
	Res,
	UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApiOkResponse, ApiOperation, getSchemaPath } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import type { Request, Response } from "express";

import { AuthClientGrpc } from "./auth.grpc";
import {
	AccessTokenResponse,
	OkResponse,
	SendOtpRequest,
	TelegramFinalizeRequest,
	TelegramInitResponse,
	TelegramVerifyRequest,
	VerifyOtpRequest,
} from "./dto";
import { TelegramAuthQuery } from "./interfaces";

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
	@ApiOkResponse({ type: OkResponse })
	@Throttle({ default: { limit: 5, ttl: 60000 } })
	@Post("otp/send")
	@HttpCode(HttpStatus.OK)
	public async sendOtp(@Body() dto: SendOtpRequest) {
		return this.client.call("sendOtp", dto);
	}

	@ApiOperation({
		summary: "Verify otp code",
		description:
			"Verifies the code sent to the user phone number or email and returns an access token.",
	})
	@ApiOkResponse({ type: AccessTokenResponse })
	@Throttle({ default: { limit: 5, ttl: 60000 } })
	@Post("otp/verify")
	@HttpCode(HttpStatus.OK)
	public async verifyOtp(
		@Body() dto: VerifyOtpRequest,
		@Res({ passthrough: true }) res: Response,
	) {
		const { accessToken, refreshToken } = await this.client.call(
			"verifyOtp",
			dto,
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
	@ApiOkResponse({ type: AccessTokenResponse })
	@Post("refresh")
	@HttpCode(HttpStatus.OK)
	public async refresh(
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response,
	) {
		const refreshToken = req.cookies?.refreshToken as string;

		const { accessToken, refreshToken: newRefreshToken } =
			await this.client.call("refresh", { refreshToken });

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
	@ApiOkResponse({ type: OkResponse })
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

	@ApiOperation({
		summary: "Initialize Telegram login",
		description:
			"Returns the data required to start the Telegram login flow.",
	})
	@Get("telegram")
	@HttpCode(HttpStatus.OK)
	public async telegramInit() {
		return this.client.call("telegramInit", {});
	}

	@ApiOperation({
		summary: "Verify Telegram login",
		description:
			"Verifies the payload returned by the Telegram login and returns either a redirect URL for account linking or an access token.",
	})
	@ApiOkResponse({
		schema: {
			oneOf: [
				{ $ref: getSchemaPath(AccessTokenResponse) },
				{ $ref: getSchemaPath(TelegramInitResponse) },
			],
		},
	})
	@Throttle({ default: { limit: 10, ttl: 60000 } })
	@Post("telegram/verify")
	@HttpCode(HttpStatus.OK)
	public async telegramVerify(
		@Body() dto: TelegramVerifyRequest,
		@Res({ passthrough: true }) res: Response,
	) {
		const query = JSON.parse(atob(dto.tgAuthResult)) as TelegramAuthQuery;

		const result = await this.client.call("telegramVerify", { query });

		if ("url" in result && result.url) {
			return result;
		}
		if (result.accessToken && result.refreshToken) {
			const { accessToken, refreshToken } = result;

			res.cookie("refreshToken", refreshToken, {
				httpOnly: true,
				secure: this.configService.get("NODE_ENV") !== "development",
				domain: this.configService.getOrThrow<string>("COOKIES_DOMAIN"),
				sameSite: "lax",
				maxAge: 30 * 24 * 60 * 60 * 1000,
			});

			return { accessToken };
		}

		throw new UnauthorizedException("Invalid Telegram login response");
	}

	@ApiOperation({
		summary: "Finalize Telegram login",
		description:
			"Consumes the pending Telegram login/link request and completes authentication.",
	})
	@ApiOkResponse({ type: AccessTokenResponse })
	@Throttle({ default: { limit: 10, ttl: 60000 } })
	@Post("telegram/finalize")
	@HttpCode(HttpStatus.OK)
	public async finalizeTelegramLogin(
		@Body() dto: TelegramFinalizeRequest,
		@Res({ passthrough: true }) res: Response,
	) {
		const { accessToken, refreshToken } = await this.client.call(
			"telegramConsume",
			dto,
		);

		res.cookie("refreshToken", refreshToken, {
			httpOnly: true,
			secure: this.configService.get("NODE_ENV") !== "development",
			domain: this.configService.getOrThrow<string>("COOKIES_DOMAIN"),
			sameSite: "lax",
			maxAge: 30 * 24 * 60 * 60 * 1000,
		});

		return { accessToken };
	}
}
