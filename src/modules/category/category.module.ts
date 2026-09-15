import { GrpcModule } from "@cinema-platform/common";
import { Module } from "@nestjs/common";

import { AccountModule } from "../account/account.module";

import { CategoryController } from "./category.controller";
import { CategoryClientGrpc } from "./category.grpc";

@Module({
	imports: [GrpcModule.register(["CATEGORY_PACKAGE"]), AccountModule],
	controllers: [CategoryController],
	providers: [CategoryClientGrpc],
	exports: [CategoryClientGrpc],
})
export class CategoryModule {}
