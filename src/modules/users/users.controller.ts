import {
	BadRequestException,
	Body,
	Controller,
	FileTypeValidator,
	Get,
	HttpCode,
	HttpStatus,
	MaxFileSizeValidator,
	ParseFilePipe,
	Patch,
	UploadedFile,
	UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
	ApiBearerAuth,
	ApiBody,
	ApiConsumes,
	ApiOkResponse,
	ApiOperation,
} from "@nestjs/swagger";
import { randomBytes } from "crypto";
import type { Express } from "express";
import "multer";

import { CurrentUser, Protected } from "@/shared/decorators";

import { MediaClientGrpc } from "../media/media.grpc";

import { GetMeResponse, PatchUserRequest, PatchUserResponse } from "./dto";
import { UsersClientGrpc } from "./users.grpc";

@Controller("users")
export class UsersController {
	public constructor(
		private readonly usersClient: UsersClientGrpc,
		private readonly mediaClient: MediaClientGrpc,
	) {}

	@ApiOperation({
		summary: "Get current user profile",
		description: "Returns authenticated user profile data.",
	})
	@ApiOkResponse({ type: GetMeResponse })
	@ApiBearerAuth()
	@Protected()
	@Get("@me")
	@HttpCode(HttpStatus.OK)
	public async getMe(@CurrentUser() userId: string) {
		const { user } = await this.usersClient.call("getMe", {
			id: userId,
		});

		return user;
	}

	@ApiOperation({
		summary: "Update current user profile",
		description: "Updates authenticated user profile data.",
	})
	@ApiOkResponse({ type: PatchUserResponse })
	@ApiBearerAuth()
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
		summary: "Update user avatar",
		description: "Uploads a new avatar for the authenticated user",
	})
	@ApiOkResponse({ type: PatchUserResponse })
	@ApiConsumes("multipart/form-data")
	@ApiBody({
		description: "Image file to upload",
		schema: {
			type: "object",
			properties: {
				file: { type: "string", format: "binary" },
			},
		},
	})
	@ApiBearerAuth()
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
		const response = await this.mediaClient.call("upload", {
			fileName: randomBytes(16).toString("hex"),
			folder: "users",
			contentType: file.mimetype,
			data: new Uint8Array(file.buffer),
			resizeWidth: 512,
			resizeHeight: 512,
		});

		return this.usersClient.call("patchUser", {
			userId,
			avatar: response.key,
		});
	}
}
