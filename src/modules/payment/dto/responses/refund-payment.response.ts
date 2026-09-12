import { ApiProperty } from "@nestjs/swagger";

export class RefundPaymentResponse {
	@ApiProperty({ example: true })
	public ok: boolean;
}
