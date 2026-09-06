import { InjectGrpcClient } from "@cinema-platform/common";
import { MovieServiceClient } from "@cinema-platform/contracts/gen/ts/movie";
import { Injectable } from "@nestjs/common";
import type { ClientGrpc } from "@nestjs/microservices";

import { AbstractGrpcClient } from "@/shared/grpc/abstract-grpc-client";

@Injectable()
export class MovieClientGrpc extends AbstractGrpcClient<MovieServiceClient> {
	constructor(@InjectGrpcClient("MOVIE_PACKAGE") client: ClientGrpc) {
		super(client, "MovieService");
	}
}
