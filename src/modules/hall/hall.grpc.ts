import { InjectGrpcClient } from "@cinema-platform/common";
import { HallServiceClient } from "@cinema-platform/contracts/gen/ts/hall";
import { Injectable } from "@nestjs/common";
import type { ClientGrpc } from "@nestjs/microservices";

import { AbstractGrpcClient } from "@/shared/grpc/abstract-grpc-client";

@Injectable()
export class HallClientGrpc extends AbstractGrpcClient<HallServiceClient> {
	constructor(@InjectGrpcClient("HALL_PACKAGE") client: ClientGrpc) {
		super(client, "HallService");
	}
}
