import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, TransformFnParams } from "class-transformer";
import { IsInt, IsISO8601, IsOptional, Max, Min } from "class-validator";

export class GetScreeningsByMovieRequest {
	@ApiPropertyOptional({
		description:
			"Only screenings on this day, `YYYY-MM-DD`. The day is counted in " +
			"**UTC** (00:00–24:00 UTC, i.e. 02:00/03:00 to 02:00/03:00 Kyiv time). " +
			"With a date, **all** screenings of the day are returned: `limit` and " +
			"`page` are ignored. Without it, screenings of all days, past ones " +
			"included, page by page.",
		example: "2025-11-08",
		format: "date",
	})
	@IsOptional()
	@IsISO8601()
	public date?: string;

	@ApiPropertyOptional({
		description: "Screenings per page (1–100). Ignored when `date` is set.",
		example: 20,
		default: 20,
		minimum: 1,
		maximum: 100,
	})
	@IsOptional()
	@IsInt()
	@Min(1)
	@Max(100)
	@Transform(({ value }: TransformFnParams) => {
		const raw = value as unknown;

		return raw !== undefined ? Number(raw) : 20;
	})
	public limit: number = 20;

	@ApiPropertyOptional({
		description: "Page number, starting at 1. Ignored when `date` is set.",
		example: 1,
		default: 1,
		minimum: 1,
	})
	@IsOptional()
	@IsInt()
	@Min(1)
	@Transform(({ value }: TransformFnParams) => {
		const raw = value as unknown;

		return raw !== undefined ? Number(raw) : 1;
	})
	public page: number = 1;
}
