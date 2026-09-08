import { GrpcModule } from "@cinema-platform/common";
import { Module } from "@nestjs/common";

import { AccountModule } from "../account/account.module";

import { ScreeningController } from "./screening.controller";
import { ScreeningClientGrpc } from "./screening.grpc";

@Module({
	imports: [GrpcModule.register(["SCREENING_PACKAGE"]), AccountModule],
	controllers: [ScreeningController],
	providers: [ScreeningClientGrpc],
	exports: [ScreeningClientGrpc],
})
export class ScreeningModule {}
