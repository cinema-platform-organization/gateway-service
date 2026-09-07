import { InjectGrpcClient } from "@cinema-platform/common";
import { TheaterServiceClient } from "@cinema-platform/contracts/gen/ts/theater";
import { Injectable } from "@nestjs/common";
import type { ClientGrpc } from "@nestjs/microservices";

import { AbstractGrpcClient } from "@/shared/grpc/abstract-grpc-client";

@Injectable()
export class TheaterClientGrpc extends AbstractGrpcClient<TheaterServiceClient> {
	constructor(@InjectGrpcClient("THEATER_PACKAGE") client: ClientGrpc) {
		super(client, "TheaterService");
	}
}
