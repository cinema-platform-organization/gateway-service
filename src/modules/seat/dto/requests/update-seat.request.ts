import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsInt, IsOptional } from "class-validator";

import { SeatType } from "../responses";

export class UpdateSeatRequest {
	@ApiPropertyOptional({
		description:
			"New ticket price in UAH (whole number). Applies to new bookings only; " +
			"tickets already bought keep their price. Leave out to keep the current one.",
		example: 300,
	})
	@IsOptional()
	@IsInt()
	public price?: number;

	@ApiPropertyOptional({
		description: "New seat type. Leave out to keep the current one.",
		example: SeatType.PREMIUM,
		enum: SeatType,
	})
	@IsOptional()
	@IsEnum(SeatType)
	public type?: SeatType;
}
