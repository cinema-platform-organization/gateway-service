import { GrpcModule } from "@cinema-platform/common";
import { Module } from "@nestjs/common";

import { PaymentModule } from "../payment/payment.module";

import { WebhookController } from "./webhook.controller";

@Module({
	imports: [PaymentModule, GrpcModule.register(["PAYMENT_PACKAGE"])],
	controllers: [WebhookController],
})
export class WebhookModule {}
