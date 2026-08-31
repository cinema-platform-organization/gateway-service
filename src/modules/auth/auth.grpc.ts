import { InjectGrpcClient } from "@cinema-platform/common";
import type { AuthServiceClient } from "@cinema-platform/contracts/gen/auth";
import { Injectable } from "@nestjs/common";
import type { ClientGrpc } from "@nestjs/microservices";

import { AbstractGrpcClient } from "@/shared/grpc/abstract-grpc-client";

@Injectable()
export class AuthClientGrpc extends AbstractGrpcClient<AuthServiceClient> {
	constructor(@InjectGrpcClient("AUTH_PACKAGE") client: ClientGrpc) {
		super(client, "AuthService");
	}
}
