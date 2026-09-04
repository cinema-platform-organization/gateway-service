import { InjectGrpcClient } from "@cinema-platform/common";
import { MediaServiceClient } from "@cinema-platform/contracts/gen/ts/media";
import { Injectable } from "@nestjs/common";
import type { ClientGrpc } from "@nestjs/microservices";

import { AbstractGrpcClient } from "@/shared/grpc/abstract-grpc-client";

@Injectable()
export class MediaClientGrpc extends AbstractGrpcClient<MediaServiceClient> {
	constructor(@InjectGrpcClient("MEDIA_PACKAGE") client: ClientGrpc) {
		super(client, "MediaService");
	}
}
