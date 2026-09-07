import { applyDecorators, UseGuards } from "@nestjs/common";

import { AuthGuard, Role, RolesGuard } from "../guards";

import { Roles } from "./roles.decorator";

export function Protected(...roles: Role[]) {
	if (roles.length === 0) {
		return applyDecorators(UseGuards(AuthGuard));
	}

	return applyDecorators(Roles(...roles), UseGuards(AuthGuard, RolesGuard));
}
