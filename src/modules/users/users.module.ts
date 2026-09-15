import { GrpcModule } from "@cinema-platform/common";
import { Module } from "@nestjs/common";

import { AccountModule } from "../account/account.module";
import { MediaModule } from "../media/media.module";

import { UsersController } from "./users.controller";
import { UsersClientGrpc } from "./users.grpc";

@Module({
	imports: [
		GrpcModule.register(["USERS_PACKAGE"]),
		AccountModule,
		MediaModule,
	],
	controllers: [UsersController],
	providers: [UsersClientGrpc],
	exports: [UsersClientGrpc],
})
export class UsersModule {}
