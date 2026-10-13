import {
	BadRequestException,
	Body,
	Controller,
	FileTypeValidator,
	Get,
	HttpCode,
	HttpStatus,
	Logger,
	MaxFileSizeValidator,
	ParseFilePipe,
	Patch,
	UploadedFile,
	UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
	ApiBody,
	ApiConsumes,
	ApiOkResponse,
	ApiOperation,
	ApiTags,
} from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { randomBytes } from "crypto";
import type { Express } from "express";
import "multer";

import { CurrentUser, Protected } from "@/shared/decorators";
import { ApiErrors, type ApiErrorSpec } from "@/shared/swagger";
import { mapRole } from "@/shared/utils";

import { AccountClientGrpc } from "../account/account.grpc";
import { MediaClientGrpc } from "../media/media.grpc";

import { GetMeResponse, PatchUserRequest, PatchUserResponse } from "./dto";
import { UsersClientGrpc } from "./users.grpc";

const USER_NOT_FOUND: ApiErrorSpec = {
	status: 404,
	message: "User not found",
	when: "The account has no user profile (profile creation failed at login)",
};

@ApiTags("Users")
@Controller("users")
export class UsersController {
	private readonly logger = new Logger(UsersController.name);

	public constructor(
		private readonly usersClient: UsersClientGrpc,
		private readonly mediaClient: MediaClientGrpc,
		private readonly accountClient: AccountClientGrpc,
	) {}

	@ApiOperation({
		summary: "Get my profile",
		description:
			"Returns the current user's profile together with account data " +
			"(email, phone, role).",
	})
	@ApiOkResponse({ type: GetMeResponse, description: "The current user" })
	@ApiErrors({
		auth: "user",
		errors: [
			USER_NOT_FOUND,
			{
				status: 404,
				message: "Account not found",
				when: "Token is valid but the account behind it no longer exists",
			},
		],
	})
	@Protected()
	@Get("@me")
	@HttpCode(HttpStatus.OK)
	public async getMe(@CurrentUser() userId: string) {
		const [{ user }, account] = await Promise.all([
			this.usersClient.call("getMe", { id: userId }),
			this.accountClient.call("getAccount", { id: userId }),
		]);

		return { ...user, role: mapRole(account.role) };
	}

	@ApiOperation({
		summary: "Update my profile",
		description:
			"Changes the current user's display name. Returns `{ ok: true }`, not " +
			"the updated profile.",
	})
	@ApiOkResponse({ type: PatchUserResponse, description: "Name changed" })
	@ApiErrors({
		auth: "user",
		validation: ["name must be a string", "name should not be empty"],
		errors: [USER_NOT_FOUND],
	})
	@Protected()
	@Patch("@me")
	@HttpCode(HttpStatus.OK)
	public async patchUser(
		@CurrentUser() userId: string,
		@Body() dto: PatchUserRequest,
	) {
		return this.usersClient.call("patchUser", { userId, ...dto });
	}

	@ApiOperation({
		summary: "Change my avatar",
		description:
			"Uploads a new avatar for the current user, sent as `multipart/form-data` " +
			"with the image in the `file` field. JPG, PNG, WEBP or GIF (checked by MIME " +
			"type), up to 10 MB. Stored under `users/`.\n\n" +
			"The previous avatar is deleted from storage afterwards; if that fails, " +
			"the request still succeeds.",
	})
	@ApiConsumes("multipart/form-data")
	@ApiBody({
		description: "Image file to upload",
		schema: {
			type: "object",
			properties: {
				file: {
					type: "string",
					format: "binary",
					description:
						"Avatar image (JPG, PNG, WEBP or GIF, up to 10 MB). Required.",
				},
			},
		},
	})
	@ApiOkResponse({ type: PatchUserResponse, description: "Avatar changed" })
	@ApiErrors({
		auth: "user",
		throttle: 5,
		errors: [
			{
				status: 400,
				message: "File size must not exceed 10MB",
				when: "File is larger than 10 MB",
			},
			{
				status: 400,
				message: "Only JPG, PNG, WEBP, GIF image formats are allowed",
				when: "File's MIME type is not image/jpeg, image/png, image/webp or image/gif",
			},
			{
				status: 400,
				message: "Invalid file",
				when: "No `file` was sent, or it could not be validated",
			},
			USER_NOT_FOUND,
			{
				status: 500,
				message: "<error text from media storage>",
				when: "Media storage failed to save the file. The message is the storage error from the media service, passed through as is, so it varies",
			},
		],
	})
	@Throttle({ default: { limit: 5, ttl: 60000 } })
	@UseInterceptors(FileInterceptor("file"))
	@Protected()
	@Patch("@me/avatar")
	@HttpCode(HttpStatus.OK)
	public async changeAvatar(
		@CurrentUser() userId: string,
		@UploadedFile(
			new ParseFilePipe({
				validators: [
					new MaxFileSizeValidator({
						maxSize: 10 * 1024 * 1024,
						message: "File size must not exceed 10MB",
					}),
					new FileTypeValidator({
						fileType: /(jpg|jpeg|png|webp|gif)$/i,
					}),
				],
				exceptionFactory(error) {
					if (error.includes("File is too large")) {
						throw new BadRequestException(
							"File size must not exceed 10MB",
						);
					}
					if (error.includes("Invalid file type")) {
						throw new BadRequestException(
							"Only JPG, PNG, WEBP, GIF image formats are allowed",
						);
					}

					throw new BadRequestException("Invalid file");
				},
			}),
		)
		file: Express.Multer.File,
	) {
		const { user } = await this.usersClient.call("getMe", { id: userId });
		const previousAvatarKey = user?.avatar;

		const response = await this.mediaClient.call("upload", {
			fileName: randomBytes(16).toString("hex"),
			folder: "users",
			contentType: file.mimetype,
			data: new Uint8Array(file.buffer),
			resizeWidth: 512,
			resizeHeight: 512,
		});

		const result = await this.usersClient.call("patchUser", {
			userId,
			avatar: response.key,
		});

		if (previousAvatarKey) {
			this.mediaClient
				.call("delete", { key: previousAvatarKey })
				.catch(error =>
					this.logger.warn(
						{ err: error as Error, userId, key: previousAvatarKey },
						"Failed to delete previous avatar",
					),
				);
		}

		return result;
	}
}
