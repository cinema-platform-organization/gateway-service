import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
	IsArray,
	IsBoolean,
	IsInt,
	IsNotEmpty,
	IsOptional,
	IsString,
	ValidateNested,
} from "class-validator";

class SeatDto {
	@ApiProperty({ example: "seat_123" })
	@IsString()
	public seatId: string;

	@ApiProperty({ example: 250 })
	@IsInt()
	public price: number;
}

export class InitPaymentRequest {
	@ApiProperty({ example: "screening_123" })
	@IsString()
	@IsNotEmpty()
	public screeningId: string;

	@ApiProperty({ type: [SeatDto] })
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => SeatDto)
	public seats: SeatDto[];

	@ApiPropertyOptional({ example: true })
	@IsBoolean()
	@IsOptional()
	public savePaymentMethod: boolean;

	@ApiPropertyOptional({ example: "pm_123" })
	@IsString()
	@IsOptional()
	public paymentMethodId: string;
}
