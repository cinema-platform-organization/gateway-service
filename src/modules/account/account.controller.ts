import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";

import { CurrentUser, Protected } from "@/shared/decorators";
import { ApiErrors } from "@/shared/swagger";

import { AccountClientGrpc } from "./account.grpc";
import {
	ConfirmEmailChangeRequest,
	ConfirmPhoneChangeRequest,
	InitEmailChangeRequest,
	InitPhoneChangeRequest,
} from "./dto";
import { OkResponse } from "./dto/responses";

const EMAIL_VALIDATION = [
	"email should not be empty",
	"email must be an email",
];

const PHONE_VALIDATION = [
	"phone should not be empty",
	"phone must match /^\\+?\\d{10,15}$/ regular expression",
];

const CODE_VALIDATION = [
	"code should not be empty",
	"code must be a number string",
	"code must be longer than or equal to 6 characters",
];

@ApiTags("Account")
@Controller("account")
export class AccountController {
	public constructor(private readonly client: AccountClientGrpc) {}

	@ApiOperation({
		summary: "Start email change",
		description:
			"Starts changing the email of the current user.\n\n" +
			"Generates a 6-digit code, emails it to the **new** address and stores " +
			"the pending change for 5 minutes. The account email is not changed yet — " +
			"confirm it with `POST /account/email/confirm`.\n\n" +
			"Calling it again replaces the previous pending email change and sends a new code.",
	})
	@ApiOkResponse({
		type: OkResponse,
		description: "Code sent, pending change stored",
	})
	@ApiErrors({
		auth: "user",
		validation: EMAIL_VALIDATION,
		throttle: 5,
		errors: [
			{
				status: 409,
				message: "Email already in use",
				when: "Another account already uses this email",
			},
		],
	})
	@Throttle({ default: { limit: 5, ttl: 60000 } })
	@Protected()
	@Post("email/init")
	@HttpCode(HttpStatus.OK)
	public async initEmailChange(
		@Body() dto: InitEmailChangeRequest,
		@CurrentUser() userId: string,
	) {
		return this.client.call("initEmailChange", { ...dto, userId });
	}

	@ApiOperation({
		summary: "Confirm email change",
		description:
			"Finishes the email change started with `POST /account/email/init`.\n\n" +
			"Checks that the email matches the pending change, that it is not older " +
			"than 5 minutes and that the code is correct. On success the account email " +
			"is replaced, marked as verified and the pending change is removed.",
	})
	@ApiOkResponse({
		type: OkResponse,
		description: "Email changed and marked as verified",
	})
	@ApiErrors({
		auth: "user",
		validation: [...EMAIL_VALIDATION, ...CODE_VALIDATION],
		throttle: 10,
		errors: [
			{
				status: 400,
				message: "Email mismatch",
				when: "Email differs from the one sent to /account/email/init",
			},
			{
				status: 400,
				message: "Code expired",
				when: "More than 5 minutes passed since /account/email/init",
			},
			{
				status: 404,
				message: "No pending request",
				when: "No email change was started, or it was already confirmed",
			},
			{
				status: 404,
				message: "Invalid or expired code",
				when: "Code is wrong, or it was already used",
			},
			{
				status: 409,
				message: "Email already in use",
				when: "Another account took this email after the code was sent",
			},
		],
	})
	@Throttle({ default: { limit: 10, ttl: 60000 } })
	@Protected()
	@Post("email/confirm")
	@HttpCode(HttpStatus.OK)
	public async confirmEmailChange(
		@Body() dto: ConfirmEmailChangeRequest,
		@CurrentUser() userId: string,
	) {
		return this.client.call("confirmEmailChange", {
			...dto,
			userId,
		});
	}

	@ApiOperation({
		summary: "Start phone change",
		description:
			"Starts changing the phone number of the current user.\n\n" +
			"Generates a 6-digit code, sends it by SMS to the **new** number and stores " +
			"the pending change for 5 minutes. The account phone is not changed yet — " +
			"confirm it with `POST /account/phone/confirm`.\n\n" +
			"Calling it again replaces the previous pending phone change and sends a new code.",
	})
	@ApiOkResponse({
		type: OkResponse,
		description: "Code sent, pending change stored",
	})
	@ApiErrors({
		auth: "user",
		validation: PHONE_VALIDATION,
		throttle: 5,
		errors: [
			{
				status: 409,
				message: "Phone already in use",
				when: "Another account already uses this phone number",
			},
		],
	})
	@Throttle({ default: { limit: 5, ttl: 60000 } })
	@Protected()
	@Post("phone/init")
	@HttpCode(HttpStatus.OK)
	public async initPhoneChange(
		@Body() dto: InitPhoneChangeRequest,
		@CurrentUser() userId: string,
	) {
		return this.client.call("initPhoneChange", { ...dto, userId });
	}

	@ApiOperation({
		summary: "Confirm phone change",
		description:
			"Finishes the phone change started with `POST /account/phone/init`.\n\n" +
			"Checks that the phone matches the pending change, that it is not older " +
			"than 5 minutes and that the code is correct. On success the account phone " +
			"is replaced, marked as verified and the pending change is removed.",
	})
	@ApiOkResponse({
		type: OkResponse,
		description: "Phone changed and marked as verified",
	})
	@ApiErrors({
		auth: "user",
		validation: [...PHONE_VALIDATION, ...CODE_VALIDATION],
		throttle: 10,
		errors: [
			{
				status: 400,
				message: "Phone mismatch",
				when: "Phone differs from the one sent to /account/phone/init",
			},
			{
				status: 400,
				message: "Code expired",
				when: "More than 5 minutes passed since /account/phone/init",
			},
			{
				status: 404,
				message: "No pending request",
				when: "No phone change was started, or it was already confirmed",
			},
			{
				status: 404,
				message: "Invalid or expired code",
				when: "Code is wrong, or it was already used",
			},
			{
				status: 409,
				message: "Phone already in use",
				when: "Another account took this phone number after the code was sent",
			},
		],
	})
	@Throttle({ default: { limit: 10, ttl: 60000 } })
	@Protected()
	@Post("phone/confirm")
	@HttpCode(HttpStatus.OK)
	public async confirmPhoneChange(
		@Body() dto: ConfirmPhoneChangeRequest,
		@CurrentUser() userId: string,
	) {
		return this.client.call("confirmPhoneChange", {
			...dto,
			userId,
		});
	}
}
