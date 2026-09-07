import { GrpcModule } from "@cinema-platform/common";
import { Module } from "@nestjs/common";

import { AccountModule } from "../account/account.module";

import { SeatController } from "./seat.controller";
import { SeatClientGrpc } from "./seat.grpc";

@Module({
	imports: [GrpcModule.register(["SEAT_PACKAGE"]), AccountModule],
	controllers: [SeatController],
	providers: [SeatClientGrpc],
	exports: [SeatClientGrpc],
})
export class SeatModule {}
