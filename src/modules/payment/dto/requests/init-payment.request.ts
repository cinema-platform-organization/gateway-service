import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
	ArrayNotEmpty,
	IsArray,
	IsBoolean,
	IsInt,
	IsNotEmpty,
	IsOptional,
	IsString,
	ValidateNested,
} from "class-validator";

class SeatDto {
	@ApiProperty({
		description:
			"Seat id from GET /seats/hall/{hallId}. Must belong to the screening's " +
			"hall and must not be booked yet.",
		example: "kM2vRwYpQ8sN-4LzXbT7d",
	})
	@IsString()
	public seatId: string;

	@ApiProperty({
		description:
			"Ignored. Kept for compatibility: the price is always taken from the " +
			"seat on the server, whatever is sent here.",
		example: 250,
	})
	@IsInt()
	public price: number;
}

export class InitPaymentRequest {
	@ApiProperty({
		description: "Screening to book seats for",
		example: "665f1c2e8a1b2c3d4e5f6a7b",
	})
	@IsString()
	@IsNotEmpty()
	public screeningId: string;

	@ApiProperty({
		description:
			"Seats to book, at least one, each seat only once. The total amount is " +
			"the sum of the seats' current prices.",
		type: [SeatDto],
	})
	@IsArray()
	@ArrayNotEmpty()
	@ValidateNested({ each: true })
	@Type(() => SeatDto)
	public seats: SeatDto[];

	@ApiPropertyOptional({
		description:
			"`true` asks LiqPay to save the card for future payments. The card is " +
			"stored after the payment succeeds.",
		example: true,
	})
	@IsBoolean()
	@IsOptional()
	public savePaymentMethod: boolean;

	@ApiPropertyOptional({
		description: "Not used yet: accepted but ignored.",
		example: "pm_123",
	})
	@IsString()
	@IsOptional()
	public paymentMethodId: string;
}
