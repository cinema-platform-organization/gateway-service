import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, TransformFnParams } from "class-transformer";
import {
	IsBoolean,
	IsInt,
	IsOptional,
	IsString,
	Max,
	Min,
} from "class-validator";

export class GetMoviesRequest {
	@ApiPropertyOptional({
		description:
			"Filter:\n" +
			"- `now` — already released (release date in the past)\n" +
			"- `soon` — not released yet, or without a release date\n" +
			"- `all` or empty — no filter\n" +
			"- anything else — a category slug; an unknown slug returns an empty list",
		example: "now",
	})
	@IsOptional()
	@IsString()
	@Transform(({ value }: TransformFnParams) => {
		const raw = value as unknown;

		return typeof raw === "string" ? raw.trim() : raw;
	})
	public category?: string;

	@ApiPropertyOptional({
		description:
			"`true` returns `limit` random movies matching the filter instead of a page. " +
			"`page` is then ignored and the response always has `page: 1`, `totalPages: 1`.",
		example: true,
	})
	@IsOptional()
	@IsBoolean()
	@Transform(({ value }: TransformFnParams) => {
		const raw = value as unknown;

		if (raw === "true") {
			return true;
		}
		if (raw === "false") {
			return false;
		}

		return raw;
	})
	public random?: boolean;

	@ApiPropertyOptional({
		description: "Movies per page (whole number, 1–100)",
		example: 12,
		default: 10,
		minimum: 1,
		maximum: 100,
	})
	@IsOptional()
	@IsInt()
	@Min(1)
	@Max(100)
	@Transform(({ value }: TransformFnParams) => {
		const raw = value as unknown;

		return raw !== undefined ? Number(raw) : 10;
	})
	public limit: number = 10;

	@ApiPropertyOptional({
		description:
			"Page number, starting at 1. Ignored when `random=true`. " +
			"A page past the last one returns an empty list.",
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
