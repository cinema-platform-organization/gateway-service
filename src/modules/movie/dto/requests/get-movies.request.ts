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
		example: 12,
		default: 10,
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
		example: 1,
		default: 1,
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
