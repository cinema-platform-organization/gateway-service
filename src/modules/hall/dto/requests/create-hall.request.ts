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
		description:
			"Row number. Must be unique within the layout: two entries with the same " +
			"row create seats with the same row/number, which fails the whole request.",
		example: 1,
	})
	@IsInt()
	public row: number;

	@ApiProperty({
		description:
			"Number of seats in this row. Seats are numbered 1..columns from left to right.",
		example: 15,
	})
	@IsInt()
	public columns: number;

	@ApiProperty({
		description: "Seat type for every seat in this row",
		example: SeatType.STANDARD,
		enum: SeatType,
	})
	@IsEnum(SeatType)
	public type: SeatType;

	@ApiProperty({
		description:
			"Ticket price for every seat in this row, in UAH (whole number)",
		example: 300,
	})
	@IsInt()
	public price: number;
}

export class CreateHallRequest {
	@ApiProperty({
		description: "Hall name, shown to users",
		example: "Hall 1",
	})
	@IsString()
	@IsNotEmpty()
	public name: string;

	@ApiProperty({
		description: "Id of the theater the hall belongs to",
		example: "81lI6j9Ctva6e7oCPpelc",
	})
	@IsString()
	@IsNotEmpty()
	public theaterId: string;

	@ApiProperty({
		description:
			"Seat layout, one entry per row. All seats are created together with the " +
			"hall. An empty array creates a hall without seats.",
		type: [RowConfig],
	})
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => RowConfig)
	public layout: RowConfig[];
}
