import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { SeatType } from "./get-seats-by-hall.response";

export class GetSeatResponse {
	@ApiProperty({ description: "Seat id", example: "kM2vRwYpQ8sN-4LzXbT7d" })
	public id: string;

	@ApiProperty({ description: "Row number, starting at 1", example: 3 })
	public row: number;

	@ApiProperty({
		description: "Seat number within the row, starting at 1 from the left",
		example: 12,
	})
	public number: number;

	@ApiProperty({
		description: "Ticket price for this seat in UAH",
		example: 250,
	})
	public price: number;

	@ApiProperty({
		description: "Seat type",
		example: SeatType.VIP,
		enum: SeatType,
	})
	public type: SeatType;

	@ApiProperty({
		description: "Id of the hall the seat belongs to",
		example: "tZwcb0sTC-0eiRZHm59r9",
	})
	public hallId: string;

	@ApiPropertyOptional({
		description:
			"Always `unknown` in GET /seats/{id}: availability depends on a screening, " +
			"use GET /seats/hall/{hallId}?screeningId= for that. Missing in update responses.",
		example: "unknown",
	})
	public status?: string;
}
