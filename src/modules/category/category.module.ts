import { GrpcModule } from "@cinema-platform/common";
import { Module } from "@nestjs/common";

import { CategoryController } from "./category.controller";
import { CategoryClientGrpc } from "./category.grpc";

@Module({
	imports: [GrpcModule.register(["CATEGORY_PACKAGE"])],
	controllers: [CategoryController],
	providers: [CategoryClientGrpc],
	exports: [CategoryClientGrpc],
})
export class CategoryModule {}
