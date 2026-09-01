import { GrpcModule } from "@cinema-platform/common";
import { Module } from "@nestjs/common";

import { AccountController } from "./account.controller";
import { AccountClientGrpc } from "./account.grpc";

@Module({
	imports: [GrpcModule.register(["ACCOUNT_PACKAGE"])],
	controllers: [AccountController],
	providers: [AccountClientGrpc],
	exports: [AccountClientGrpc],
})
export class AccountModule {}
