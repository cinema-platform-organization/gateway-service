import { InjectGrpcClient } from "@cinema-platform/common";
import type { BookingServiceClient } from "@cinema-platform/contracts/gen/ts/booking";
import { Injectable } from "@nestjs/common";
import type { ClientGrpc } from "@nestjs/microservices";

import { AbstractGrpcClient } from "@/shared/grpc/abstract-grpc-client";

@Injectable()
export class BookingClientGrpc extends AbstractGrpcClient<BookingServiceClient> {
	constructor(@InjectGrpcClient("BOOKING_PACKAGE") client: ClientGrpc) {
		super(client, "BookingService");
	}
}
