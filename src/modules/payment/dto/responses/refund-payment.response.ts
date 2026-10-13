import { ApiProperty } from "@nestjs/swagger";

export class RefundPaymentResponse {
	@ApiProperty({
		description:
			"Always true on success: the booking is canceled and LiqPay accepted the " +
			"refund. Failures are returned as an error response, never as `ok: false`.",
		example: true,
	})
	public ok: boolean;
}
