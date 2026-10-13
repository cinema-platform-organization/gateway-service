import { ApiProperty } from "@nestjs/swagger";

export class InitPaymentResponse {
	@ApiProperty({
		description:
			"LiqPay checkout page. Redirect the user there to pay. After paying, " +
			"LiqPay sends the user back to /account/tickets on the site; the booking " +
			"is confirmed when LiqPay notifies the API, which can be a few seconds later.",
		example: "https://www.liqpay.ua/api/3/checkout?data=...&signature=...",
		format: "uri",
	})
	public url: string;
}
