import { GrpcModule } from "@cinema-platform/common";
import { Module } from "@nestjs/common";

import { MediaClientGrpc } from "./media.grpc";

@Module({
	imports: [GrpcModule.register(["MEDIA_PACKAGE"])],
	providers: [MediaClientGrpc],
	exports: [MediaClientGrpc],
})
export class MediaModule {}
