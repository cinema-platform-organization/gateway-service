import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
	IsArray,
	IsEnum,
	IsInt,
	IsNotEmpty,
	IsString,
	ValidateNested,
} from "class-validator";

export enum SeatType {
	STANDARD = "standard",
	VIP = "vip",
	PREMIUM = "premium",
}

class RowConfig {
	@ApiProperty({
		example: 1,
	})
	@IsInt()
	public row: number;

	@ApiProperty({
		example: 15,
	})
	@IsInt()
	public columns: number;

	@ApiProperty({
		example: SeatType.STANDARD,
		enum: SeatType,
	})
	@IsEnum(SeatType)
	public type: SeatType;

	@ApiProperty({
		example: 300,
	})
	@IsInt()
	public price: number;
}

export class CreateHallRequest {
	@ApiProperty({
		example: "Hall 1",
	})
	@IsString()
	@IsNotEmpty()
	public name: string;

	@ApiProperty({
		example: "123456",
	})
	@IsString()
	@IsNotEmpty()
	public theaterId: string;

	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => RowConfig)
	public layout: RowConfig[];
}
