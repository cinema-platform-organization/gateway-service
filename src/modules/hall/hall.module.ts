import { GrpcModule } from "@cinema-platform/common";
import { Module } from "@nestjs/common";

import { AccountModule } from "../account/account.module";

import { HallController } from "./hall.controller";
import { HallClientGrpc } from "./hall.grpc";

@Module({
	imports: [GrpcModule.register(["HALL_PACKAGE"]), AccountModule],
	controllers: [HallController],
	providers: [HallClientGrpc],
	exports: [HallClientGrpc],
})
export class HallModule {}
