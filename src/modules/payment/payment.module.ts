import { GrpcModule } from "@cinema-platform/common";
import { Global, Module } from "@nestjs/common";

import { PaymentController } from "./payment.controller";
import { PaymentClientGrpc } from "./payment.grpc";

@Global()
@Module({
	imports: [GrpcModule.register(["PAYMENT_PACKAGE"])],
	controllers: [PaymentController],
	providers: [PaymentClientGrpc],
	exports: [PaymentClientGrpc],
})
export class PaymentModule {}
