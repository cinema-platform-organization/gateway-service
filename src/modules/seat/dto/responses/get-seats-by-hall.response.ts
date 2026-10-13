import { ApiProperty } from "@nestjs/swagger";

export enum SeatType {
	STANDARD = "standard",
	VIP = "vip",
	PREMIUM = "premium",
}

export enum SeatAvailability {
	AVAILABLE = "available",
	RESERVED = "reserved",
}

export class GetSeatsByHallResponse {
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

	@ApiProperty({
		description:
			"Availability for the screening given in `screeningId`:\n" +
			"- `reserved` — the seat already has a ticket for this screening\n" +
			"- `available` — it doesn't\n\n" +
			"Only present when `screeningId` is sent; without it the field is missing.",
		example: SeatAvailability.AVAILABLE,
		enum: SeatAvailability,
	})
	public status: SeatAvailability;
}
