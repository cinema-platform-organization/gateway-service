import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsNotEmpty, IsString } from "class-validator";

export class CreateScreeningRequest {
	@ApiProperty({
		description:
			"Movie id. Not checked on create: a wrong id saves fine, but the " +
			"screening then fails to load (500) and is skipped in lists.",
		example: "026f20c4-4826-4bea-b5e0-72ce8dda53d4",
	})
	@IsNotEmpty()
	@IsString()
	public movieId: string;

	@ApiProperty({
		description: "Hall id. Must exist.",
		example: "tZwcb0sTC-0eiRZHm59r9",
	})
	@IsNotEmpty()
	@IsString()
	public hallId: string;

	@ApiProperty({
		description:
			"Start time, ISO 8601. **Include a time zone offset** (`+02:00`, `+03:00` " +
			"or `Z`): a time without one is read as UTC, so `16:30` becomes 18:30 or " +
			"19:30 in Kyiv. Must not overlap another screening in the same hall.",
		example: "2026-12-21T16:30:00+02:00",
		format: "date-time",
	})
	@IsNotEmpty()
	@IsDateString()
	public startAt: string;

	@ApiProperty({
		description:
			"End time, ISO 8601 with a time zone offset, like `startAt`. Must be " +
			"after `startAt`.",
		example: "2026-12-21T19:30:00+02:00",
		format: "date-time",
	})
	@IsNotEmpty()
	@IsDateString()
	public endAt: string;
}
