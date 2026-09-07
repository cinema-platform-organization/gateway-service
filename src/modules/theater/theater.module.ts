import { GrpcModule } from "@cinema-platform/common";
import { Module } from "@nestjs/common";

import { AccountModule } from "../account/account.module";

import { TheaterController } from "./theater.controller";
import { TheaterClientGrpc } from "./theater.grpc";

@Module({
	imports: [GrpcModule.register(["THEATER_PACKAGE"]), AccountModule],
	controllers: [TheaterController],
	providers: [TheaterClientGrpc],
	exports: [TheaterClientGrpc],
})
export class TheaterModule {}
