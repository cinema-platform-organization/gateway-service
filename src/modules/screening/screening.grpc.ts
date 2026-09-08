import { InjectGrpcClient } from "@cinema-platform/common";
import { ScreeningServiceClient } from "@cinema-platform/contracts/gen/ts/screening";
import { Injectable } from "@nestjs/common";
import type { ClientGrpc } from "@nestjs/microservices";

import { AbstractGrpcClient } from "@/shared/grpc/abstract-grpc-client";

@Injectable()
export class ScreeningClientGrpc extends AbstractGrpcClient<ScreeningServiceClient> {
	constructor(@InjectGrpcClient("SCREENING_PACKAGE") client: ClientGrpc) {
		super(client, "ScreeningService");
	}
}
