import { InjectGrpcClient } from "@cinema-platform/common";
import { UsersServiceClient } from "@cinema-platform/contracts/gen/users";
import { Injectable } from "@nestjs/common";
import type { ClientGrpc } from "@nestjs/microservices";

import { AbstractGrpcClient } from "@/shared/grpc/abstract-grpc-client";

@Injectable()
export class UsersClientGrpc extends AbstractGrpcClient<UsersServiceClient> {
	constructor(@InjectGrpcClient("USERS_PACKAGE") client: ClientGrpc) {
		super(client, "UsersService");
	}
}
