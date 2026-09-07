import { InjectGrpcClient } from "@cinema-platform/common";
import { SeatServiceClient } from "@cinema-platform/contracts/gen/ts/seat";
import { Injectable } from "@nestjs/common";
import type { ClientGrpc } from "@nestjs/microservices";

import { AbstractGrpcClient } from "@/shared/grpc/abstract-grpc-client";

@Injectable()
export class SeatClientGrpc extends AbstractGrpcClient<SeatServiceClient> {
	constructor(@InjectGrpcClient("SEAT_PACKAGE") client: ClientGrpc) {
		super(client, "SeatService");
	}
}
