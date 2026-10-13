import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, TransformFnParams } from "class-transformer";
import { IsInt, IsOptional, Max, Min } from "class-validator";

export class GetBookingsRequest {
	@ApiPropertyOptional({
		description:
			"How many bookings to return per page (whole number, 1–100).",
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
		description:
			"Page number, starting at 1 (whole number). A page past the last one " +
			"returns an empty list.",
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
