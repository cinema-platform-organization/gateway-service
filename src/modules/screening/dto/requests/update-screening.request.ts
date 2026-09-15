import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsOptional, IsString } from "class-validator";

export class UpdateScreeningRequest {
	@ApiPropertyOptional({ example: "026f20c4-4826-4bea-b5e0-72ce8dda53d4" })
	@IsOptional()
	@IsString()
	public movieId?: string;

	@ApiPropertyOptional({ example: "tZwcb0sTC-0eiRZHm59r9" })
	@IsOptional()
	@IsString()
	public hallId?: string;

	@ApiPropertyOptional({ example: "2026-12-21 16:30:00.000" })
	@IsOptional()
	@IsDateString()
	public startAt?: string;

	@ApiPropertyOptional({ example: "2026-12-21 19:30:00.000" })
	@IsOptional()
	@IsDateString()
	public endAt?: string;
}
