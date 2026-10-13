import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsOptional, IsString } from "class-validator";

export class UpdateScreeningRequest {
	@ApiPropertyOptional({
		description:
			"New movie id. Not checked: a wrong id saves fine, but the screening " +
			"then fails to load (500). Leave out to keep the current movie.",
		example: "026f20c4-4826-4bea-b5e0-72ce8dda53d4",
	})
	@IsOptional()
	@IsString()
	public movieId?: string;

	@ApiPropertyOptional({
		description:
			"New hall id, must exist. Existing tickets keep the old hall. Leave out " +
			"to keep the current hall.",
		example: "tZwcb0sTC-0eiRZHm59r9",
	})
	@IsOptional()
	@IsString()
	public hallId?: string;

	@ApiPropertyOptional({
		description:
			"New start time, ISO 8601 with a time zone offset (without one it is " +
			"read as UTC). Leave out to keep the current one.",
		example: "2026-12-21T16:30:00+02:00",
		format: "date-time",
	})
	@IsOptional()
	@IsDateString()
	public startAt?: string;

	@ApiPropertyOptional({
		description:
			"New end time, ISO 8601 with a time zone offset. Must stay after the " +
			"start time. Leave out to keep the current one.",
		example: "2026-12-21T19:30:00+02:00",
		format: "date-time",
	})
	@IsOptional()
	@IsDateString()
	public endAt?: string;
}
