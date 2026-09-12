import { ApiProperty } from "@nestjs/swagger";

export class InitPaymentResponse {
	@ApiProperty({
		example: "https://www.liqpay.ua/api/3/checkout?data=...&signature=...",
	})
	public url: string;
}
