import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";

import { AccountClientGrpc } from "@/modules/account/account.grpc";

import { ROLES_KEY } from "../decorators";

export enum Role {
	USER = 0,
	ADMIN = 1,
	UNRECOGNIZED = -1,
}

@Injectable()
export class RolesGuard implements CanActivate {
	public constructor(
		private readonly reflector: Reflector,
		private readonly accountClient: AccountClientGrpc,
	) {}

	public async canActivate(context: ExecutionContext): Promise<boolean> {
		const required = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
			context.getHandler(),
			context.getClass(),
		]);

		if (!required || required.length === 0) {
			return true;
		}

		const request = context.switchToHttp().getRequest<Request>();
		const user = request.user;

		if (!user) {
			throw new ForbiddenException("User context missing");
		}

		const account = await this.accountClient.call("getAccount", {
			id: user.id,
		});

		if (!account) {
			throw new NotFoundException("Account not found");
		}

		if (!required.includes(account.role)) {
			throw new ForbiddenException(
				"You do not have permission to access this resource",
			);
		}

		return true;
	}
}
