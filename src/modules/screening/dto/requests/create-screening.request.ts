import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsNotEmpty, IsString } from "class-validator";

export class CreateScreeningRequest {
	@ApiProperty({ example: "026f20c4-4826-4bea-b5e0-72ce8dda53d4" })
	@IsNotEmpty()
	@IsString()
	public movieId: string;

	@ApiProperty({ example: "tZwcb0sTC-0eiRZHm59r9" })
	@IsNotEmpty()
	@IsString()
	public hallId: string;

	@ApiProperty({ example: "2026-12-21 16:30:00.000" })
	@IsNotEmpty()
	@IsDateString()
	public startAt: string;

	@ApiProperty({ example: "2026-12-21 19:30:00.000" })
	@IsNotEmpty()
	@IsDateString()
	public endAt: string;
}
