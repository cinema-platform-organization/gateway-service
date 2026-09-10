import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";

import { PaymentClientGrpc } from "@/modules/payment/payment.grpc";

@Controller("webhook")
export class WebhookController {
	public constructor(private readonly paymentClient: PaymentClientGrpc) {}

	@Post("liqpay")
	@HttpCode(HttpStatus.OK)
	public async handleLiqpay(
		@Body() raw: { data?: string; signature?: string },
	) {
		if (!raw.data || !raw.signature) {
			return { status: "ignored" };
		}

		await this.paymentClient.call("verifyPaymentCallback", {
			data: raw.data,
			signature: raw.signature,
		});

		return { status: "ok" };
	}
}
