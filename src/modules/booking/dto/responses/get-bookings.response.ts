import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { TicketResponse } from "./ticket.response";

export enum OrderStatus {
	PENDING = "PENDING",
	PAID = "PAID",
	CANCELED = "CANCELED",
}

export class GetBookingsResponse {
	@ApiProperty({ example: "X6KBMTnCDkbrPN_I0YXG8" })
	public id: string;

	@ApiProperty({ example: 750 })
	public amount: number;

	@ApiProperty({ example: OrderStatus.PAID, enum: OrderStatus })
	public status: OrderStatus;

	@ApiPropertyOptional({
		example: "aHR0cHM6Ly9jaW5lbWEtcGxhdGZvcm0uY29tL29yZGVyLzEyMw==",
	})
	public qrCode?: string;

	@ApiProperty({ type: [TicketResponse] })
	public tickets: TicketResponse[];
}
