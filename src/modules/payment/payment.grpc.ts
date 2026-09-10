import { InjectGrpcClient } from "@cinema-platform/common";
import type { PaymentServiceClient } from "@cinema-platform/contracts/gen/ts/payment";
import { Injectable } from "@nestjs/common";
import type { ClientGrpc } from "@nestjs/microservices";

import { AbstractGrpcClient } from "@/shared/grpc/abstract-grpc-client";

@Injectable()
export class PaymentClientGrpc extends AbstractGrpcClient<PaymentServiceClient> {
	constructor(@InjectGrpcClient("PAYMENT_PACKAGE") client: ClientGrpc) {
		super(client, "PaymentService");
	}
}
