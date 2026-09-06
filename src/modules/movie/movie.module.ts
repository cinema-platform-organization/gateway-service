import { GrpcModule } from "@cinema-platform/common";
import { Module } from "@nestjs/common";

import { MovieController } from "./movie.controller";
import { MovieClientGrpc } from "./movie.grpc";

@Module({
	imports: [GrpcModule.register(["MOVIE_PACKAGE"])],
	controllers: [MovieController],
	providers: [MovieClientGrpc],
	exports: [MovieClientGrpc],
})
export class MovieModule {}
