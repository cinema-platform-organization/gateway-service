import { InjectGrpcClient } from "@cinema-platform/common";
import { AccountServiceClient } from "@cinema-platform/contracts/gen/ts/account";
import { Injectable } from "@nestjs/common";
import type { ClientGrpc } from "@nestjs/microservices";

import { AbstractGrpcClient } from "@/shared/grpc/abstract-grpc-client";

@Injectable()
export class AccountClientGrpc extends AbstractGrpcClient<AccountServiceClient> {
	constructor(@InjectGrpcClient("ACCOUNT_PACKAGE") client: ClientGrpc) {
		super(client, "AccountService");
	}
}
