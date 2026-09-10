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
	@IsString()
	public seatId: string;

	@IsInt()
	public price: number;
}

export class InitPaymentRequest {
	@IsString()
	@IsNotEmpty()
	public screeningId: string;

	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => SeatDto)
	public seats: SeatDto[];

	@IsBoolean()
	@IsOptional()
	public savePaymentMethod: boolean;

	@IsString()
	@IsOptional()
	public paymentMethodId: string;
}
