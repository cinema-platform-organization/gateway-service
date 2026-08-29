import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Patch,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from "@nestjs/swagger";
import { lastValueFrom } from "rxjs";

import { CurrentUser, Protected } from "@/shared/decorators";

import { GetMeResponse, PatchUserRequest } from "./dto";
import { UsersClientGrpc } from "./users.grpc";

@Controller("users")
export class UsersController {
	public constructor(private readonly client: UsersClientGrpc) {}

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
		const { user } = await lastValueFrom(
			this.client.getMe({
				id: userId,
			}),
		);

		return user;
	}

	@ApiBearerAuth()
	@Protected()
	@Patch("@me")
	@HttpCode(HttpStatus.OK)
	public async patchUser(
		@CurrentUser() userId: string,
		@Body() dto: PatchUserRequest,
	) {
		return this.client.patchUser({ userId, ...dto });
	}
}
