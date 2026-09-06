import { InjectGrpcClient } from "@cinema-platform/common";
import { CategoryServiceClient } from "@cinema-platform/contracts/gen/ts/category";
import { Injectable } from "@nestjs/common";
import type { ClientGrpc } from "@nestjs/microservices";

import { AbstractGrpcClient } from "@/shared/grpc/abstract-grpc-client";

@Injectable()
export class CategoryClientGrpc extends AbstractGrpcClient<CategoryServiceClient> {
	constructor(@InjectGrpcClient("CATEGORY_PACKAGE") client: ClientGrpc) {
		super(client, "CategoryService");
	}
}
