import {
	BadRequestException,
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
import {
	ApiCookieAuth,
	ApiExtraModels,
	ApiOkResponse,
	ApiOperation,
	ApiTags,
	getSchemaPath,
} from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import type { Request, Response } from "express";

import { ApiErrors } from "@/shared/swagger";

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

const SET_REFRESH_COOKIE = {
	"Set-Cookie": {
		description:
			"Sets the `refreshToken` cookie: httpOnly, Secure (outside development), " +
			"SameSite=Lax, Domain from COOKIES_DOMAIN, Max-Age 30 days. " +
			"It is sent automatically to POST /auth/refresh.",
		schema: {
			type: "string",
			example:
				"refreshToken=YTFiMmMzZDQ.MTc2MDM1NjAwMA.MTc2Mjk0ODAwMA.5e88...; Max-Age=2592000; Domain=cinema-platform.site; Path=/; HttpOnly; Secure; SameSite=Lax",
		},
	},
};

const IDENTIFIER_VALIDATION = [
	"identifier must be a string",
	"Identifier must be a valid email",
	"Identifier must be a valid phone number",
	"Invalid identifier",
	"type must be one of the following values: phone, email",
];

const CODE_VALIDATION = [
	"code should not be empty",
	"code must be a number string",
	"code must be longer than or equal to 6 characters",
];

const INVALID_REFRESH_TOKEN_ERRORS = [
	{
		status: 401,
		message: "Invalid format",
		when: "No refreshToken cookie was sent, or its value is not a token",
	},
	{
		status: 401,
		message: "Invalid signature",
		when: "Refresh token was modified or signed with a different key",
	},
	{
		status: 401,
		message: "Expired",
		when: "Refresh token lifetime has passed; the user has to log in again",
	},
	{
		status: 401,
		message: "Error",
		when: "Expiry inside the refresh token is not a valid number",
	},
];

@ApiTags("Auth")
@ApiExtraModels(AccessTokenResponse, TelegramInitResponse)
@Controller("auth")
export class AuthController {
	public constructor(
		private readonly client: AuthClientGrpc,
		private readonly configService: ConfigService,
	) {}

	@ApiOperation({
		summary: "Send login code",
		description:
			"Sends a 6-digit login code by email or SMS. This is the first step of " +
			"logging in **and** of signing up: if no account exists for the identifier, " +
			"it is created right away (unverified).\n\n" +
			"The code is valid for 5 minutes. Requesting a new code replaces the " +
			"previous one. Continue with `POST /auth/otp/verify`.",
	})
	@ApiOkResponse({ type: OkResponse, description: "Code generated and sent" })
	@ApiErrors({
		validation: IDENTIFIER_VALIDATION,
		throttle: 5,
	})
	@Throttle({ default: { limit: 5, ttl: 60000 } })
	@Post("otp/send")
	@HttpCode(HttpStatus.OK)
	public async sendOtp(@Body() dto: SendOtpRequest) {
		return this.client.call("sendOtp", dto);
	}

	@ApiOperation({
		summary: "Log in with code",
		description:
			"Checks the code from `POST /auth/otp/send` and logs the user in.\n\n" +
			"On success:\n" +
			"- the email or phone is marked as verified\n" +
			"- the user profile is created if it does not exist yet\n" +
			"- the access token is returned in the body\n" +
			"- the refresh token is set as an httpOnly cookie (never in the body)\n\n" +
			"The code is deleted after a successful check, so it cannot be reused.",
	})
	@ApiOkResponse({
		type: AccessTokenResponse,
		description: "Logged in",
		headers: SET_REFRESH_COOKIE,
	})
	@ApiErrors({
		validation: [...IDENTIFIER_VALIDATION, ...CODE_VALIDATION],
		throttle: 5,
		errors: [
			{
				status: 404,
				message: "Invalid or expired code",
				when: "Code is wrong, older than 5 minutes, already used, or was never sent to this identifier",
			},
			{
				status: 404,
				message: "Account not found",
				when: "Code is valid but the account was deleted in the meantime",
			},
		],
	})
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
		description:
			"Issues a new access token using the `refreshToken` cookie, and replaces " +
			"the cookie with a new refresh token.\n\n" +
			"No body or Authorization header is needed; the browser sends the cookie " +
			"automatically (requests must include credentials).\n\n" +
			"Tokens are stateless: the previous refresh token is not revoked and stays " +
			"valid until it expires.",
	})
	@ApiCookieAuth("refreshToken")
	@ApiOkResponse({
		type: AccessTokenResponse,
		description: "New access token issued, refresh cookie rotated",
		headers: SET_REFRESH_COOKIE,
	})
	@ApiErrors({
		errors: INVALID_REFRESH_TOKEN_ERRORS,
	})
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
		summary: "Log out",
		description:
			"Removes the `refreshToken` cookie. Always succeeds, even without a cookie.\n\n" +
			"Tokens are stateless and are not revoked on the server: the client must " +
			"also discard its access token, which otherwise stays valid until it expires.",
	})
	@ApiOkResponse({
		type: OkResponse,
		description: "Cookie cleared",
		headers: {
			"Set-Cookie": {
				description:
					"Clears the `refreshToken` cookie (empty value, expired date)",
				schema: {
					type: "string",
					example:
						"refreshToken=; Domain=cinema-platform.site; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax",
				},
			},
		},
	})
	@ApiErrors({ downstream: false })
	@Post("logout")
	@HttpCode(HttpStatus.OK)
	public logout(@Res({ passthrough: true }) res: Response) {
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
		summary: "Start Telegram login",
		description:
			"Returns the Telegram OAuth URL. Redirect the user there; after login " +
			"Telegram sends them back to the site with a `tgAuthResult` parameter, " +
			"which goes to `POST /auth/telegram/verify`.",
	})
	@ApiOkResponse({
		type: TelegramInitResponse,
		description: "Telegram OAuth URL",
	})
	@ApiErrors()
	@Get("telegram")
	@HttpCode(HttpStatus.OK)
	public async telegramInit() {
		return this.client.call("telegramInit", {});
	}

	@ApiOperation({
		summary: "Verify Telegram login",
		description:
			"Checks the Telegram login result (`tgAuthResult`) and its signature.\n\n" +
			"There are two possible successful responses:\n" +
			"- **`{ accessToken }`** — the Telegram account is already linked to a " +
			"phone number: the user is logged in and the refresh token cookie is set\n" +
			"- **`{ url }`** — first login with this Telegram account: the account is " +
			"created and `url` is a link to the bot, where the user shares their phone " +
			'number. The bot then gives a "Return to website" link with a `sessionId` ' +
			"for `POST /auth/telegram/finalize`. The link to the bot is valid for 5 minutes.",
	})
	@ApiOkResponse({
		description:
			"Either logged in (`accessToken`, cookie set) or a link to the bot (`url`)",
		headers: SET_REFRESH_COOKIE,
		schema: {
			oneOf: [
				{ $ref: getSchemaPath(AccessTokenResponse) },
				{ $ref: getSchemaPath(TelegramInitResponse) },
			],
		},
	})
	@ApiErrors({
		validation: [
			"tgAuthResult must be a string",
			"tgAuthResult should not be empty",
		],
		throttle: 10,
		errors: [
			{
				status: 400,
				message: "Invalid tgAuthResult",
				when: "tgAuthResult is not base64-encoded JSON",
			},
			{
				status: 401,
				message: "Invalid Telegram signature",
				when: "The data was not signed by Telegram for this bot, or was modified",
			},
			{
				status: 401,
				message: "Invalid Telegram login response",
				when: "Auth service returned neither a URL nor tokens",
			},
		],
	})
	@Throttle({ default: { limit: 10, ttl: 60000 } })
	@Post("telegram/verify")
	@HttpCode(HttpStatus.OK)
	public async telegramVerify(
		@Body() dto: TelegramVerifyRequest,
		@Res({ passthrough: true }) res: Response,
	) {
		let query: TelegramAuthQuery;

		try {
			query = JSON.parse(atob(dto.tgAuthResult)) as TelegramAuthQuery;
		} catch {
			throw new BadRequestException("Invalid tgAuthResult");
		}

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
		summary: "Finish Telegram login",
		description:
			"Last step of the first Telegram login. Exchanges the `sessionId` from the " +
			'bot\'s "Return to website" link for tokens: the access token is returned ' +
			"in the body, the refresh token is set as an httpOnly cookie.\n\n" +
			"The `sessionId` is valid for 2 minutes after the user shared their phone " +
			"number and can be used once.",
	})
	@ApiOkResponse({
		type: AccessTokenResponse,
		description: "Logged in",
		headers: SET_REFRESH_COOKIE,
	})
	@ApiErrors({
		validation: [
			"sessionId must be a string",
			"sessionId should not be empty",
		],
		throttle: 10,
		errors: [
			{
				status: 404,
				message: "Session not found",
				when: "sessionId is unknown, older than 2 minutes, or was already used",
			},
		],
	})
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
