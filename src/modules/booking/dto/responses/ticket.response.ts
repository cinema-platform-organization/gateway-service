import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export enum TicketStatus {
	RESERVED = "RESERVED",
	PAID = "PAID",
	CANCELLED = "CANCELLED",
}

export class TicketResponse {
	@ApiProperty({ example: "tZwcb0sTC-0eiRZHm59r9" })
	public id: string;

	@ApiProperty({ example: 250 })
	public price: number;

	@ApiProperty({ example: TicketStatus.PAID, enum: TicketStatus })
	public status: TicketStatus;

	@ApiPropertyOptional({ example: "2026-09-12 10:00:00.000" })
	public paidAt?: Date;

	@ApiProperty({ example: "026f20c4-4826-4bea-b5e0-72ce8dda53d4" })
	public screeningId: string;

	@ApiProperty({ example: "7dQmXz1LKpN9vT-4RyBw2" })
	public hallId: string;

	@ApiProperty({ example: "kM2vRwYpQ8sN-4LzXbT7d" })
	public seatId: string;
}
