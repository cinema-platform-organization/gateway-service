import { GrpcModule } from "@cinema-platform/common";
import { Module } from "@nestjs/common";

import { AccountModule } from "../account/account.module";
import { MediaModule } from "../media/media.module";

import { MovieController } from "./movie.controller";
import { MovieClientGrpc } from "./movie.grpc";

@Module({
	imports: [
		GrpcModule.register(["MOVIE_PACKAGE"]),
		AccountModule,
		MediaModule,
	],
	controllers: [MovieController],
	providers: [MovieClientGrpc],
	exports: [MovieClientGrpc],
})
export class MovieModule {}
