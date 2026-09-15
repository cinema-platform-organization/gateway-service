import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsInt, IsOptional } from "class-validator";

import { SeatType } from "../responses";

export class UpdateSeatRequest {
	@ApiPropertyOptional({ example: 300 })
	@IsOptional()
	@IsInt()
	public price?: number;

	@ApiPropertyOptional({ example: SeatType.PREMIUM, enum: SeatType })
	@IsOptional()
	@IsEnum(SeatType)
	public type?: SeatType;
}
