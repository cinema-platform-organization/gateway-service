import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import {
	ApiBody,
	ApiConsumes,
	ApiOkResponse,
	ApiOperation,
	ApiTags,
} from "@nestjs/swagger";
import { SkipThrottle } from "@nestjs/throttler";

import { PaymentClientGrpc } from "@/modules/payment/payment.grpc";
import { ApiErrors } from "@/shared/swagger";

@ApiTags("Webhooks")
@Controller("webhook")
export class WebhookController {
	public constructor(private readonly paymentClient: PaymentClientGrpc) {}

	@ApiOperation({
		summary: "LiqPay payment callback",
		description:
			"**Called by LiqPay, not by the frontend.** LiqPay sends it to the " +
			"`server_url` given when the payment was created, every time a " +
			"payment's status changes.\n\n" +
			"The signature is checked first. Then, depending on the LiqPay status:\n" +
			"- success — the booking is confirmed (QR code generated) and the payment " +
			"marked successful; if confirming fails, the payment is refunded " +
			"automatically\n" +
			"- failure — the payment is marked failed\n" +
			"- anything else — nothing changes\n\n" +
			"A repeated callback for an already successful payment is ignored. " +
			"A request without `data` or `signature` is answered with " +
			'`{ status: "ignored" }` and does nothing.\n\n' +
			"Not rate limited, so LiqPay callbacks are never rejected with 429.",
	})
	@ApiConsumes("application/x-www-form-urlencoded", "application/json")
	@ApiBody({
		description: "LiqPay callback, sent as a form",
		schema: {
			type: "object",
			properties: {
				data: {
					type: "string",
					description:
						"Base64-encoded JSON with the payment details (order_id, status, amount, card info, ...)",
					example:
						"eyJhY3Rpb24iOiJwYXkiLCJwYXltZW50X2lkIjoxMjM0NTY3...",
				},
				signature: {
					type: "string",
					description:
						"Base64 SHA-1 of private_key + data + private_key, proving the callback comes from LiqPay",
					example: "QvJD5u9Fg55PCx/Hdz6lzWtYwcI=",
				},
			},
		},
	})
	@ApiOkResponse({
		description:
			"`ok` — processed; `ignored` — `data` or `signature` was missing",
		schema: {
			type: "object",
			properties: {
				status: {
					type: "string",
					enum: ["ok", "ignored"],
					example: "ok",
				},
			},
		},
	})
	@ApiErrors({
		throttle: false,
		errors: [
			{
				status: 401,
				message: "Invalid LiqPay signature",
				when: "The signature does not match the data (not from LiqPay, or modified)",
			},
			{
				status: 404,
				message: "Payment not found",
				when: "`order_id` in the data does not belong to any payment",
			},
			{
				status: 400,
				message: "Payment callback has no booking reference",
				when: "A successful payment's data has no booking id (`info`)",
			},
			{
				status: 503,
				message: "Booking confirmation and auto-refund both failed",
				when: "Confirming the booking failed and LiqPay could not be reached for the refund; needs manual handling",
			},
			{
				status: 500,
				message: "Booking confirmation and auto-refund both failed",
				when: "Confirming the booking failed and LiqPay rejected the refund; needs manual handling",
			},
		],
	})
	@SkipThrottle()
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
