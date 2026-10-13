import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, TransformFnParams } from "class-transformer";
import {
	IsDateString,
	IsInt,
	IsOptional,
	IsString,
	IsUUID,
	Max,
	MaxLength,
	Min,
} from "class-validator";

export class UpdateMovieRequest {
	@ApiPropertyOptional({
		description: "New title. Leave out to keep the current one.",
		example: "Interstellar",
		maxLength: 255,
	})
	@IsOptional()
	@IsString()
	@MaxLength(255)
	public title?: string;

	@ApiPropertyOptional({
		description:
			"New slug, must be unique. Leave out to keep the current one.",
		example: "interstellar",
		maxLength: 255,
	})
	@IsOptional()
	@IsString()
	@MaxLength(255)
	public slug?: string;

	@ApiPropertyOptional({
		description: "New plot description. Leave out to keep the current one.",
		example: "A team of explorers travel through a wormhole in space.",
	})
	@IsOptional()
	@IsString()
	public description?: string;

	@ApiPropertyOptional({
		description: "New running time in minutes (whole number, at least 1)",
		example: 169,
		minimum: 1,
	})
	@IsOptional()
	@IsInt()
	@Min(1)
	@Transform(({ value }: TransformFnParams) => {
		const raw = value as unknown;

		return raw === undefined ? undefined : Number(raw);
	})
	public duration?: number;

	@ApiPropertyOptional({
		description: "New release year (whole number)",
		example: 2014,
	})
	@IsOptional()
	@IsInt()
	@Transform(({ value }: TransformFnParams) => {
		const raw = value as unknown;

		return raw === undefined ? undefined : Number(raw);
	})
	public releaseYear?: number;

	@ApiPropertyOptional({
		description:
			"New release date, ISO 8601. A date without time is stored as midnight UTC.",
		example: "2014-11-07",
		format: "date",
	})
	@IsOptional()
	@IsDateString()
	public releaseDate?: string;

	@ApiPropertyOptional({
		description: "New minimum viewer age, 0–21 (0 = no restriction)",
		example: 12,
		minimum: 0,
		maximum: 21,
	})
	@IsOptional()
	@IsInt()
	@Min(0)
	@Max(21)
	@Transform(({ value }: TransformFnParams) => {
		const raw = value as unknown;

		return raw === undefined ? undefined : Number(raw);
	})
	public ratingAge?: number;

	@ApiPropertyOptional({
		description: "New country of production",
		example: "USA",
		maxLength: 255,
	})
	@IsOptional()
	@IsString()
	@MaxLength(255)
	public country?: string;

	@ApiPropertyOptional({
		description: "Id of an existing category to move the movie to",
		example: "026f20c4-4826-4bea-b5e0-72ce8dda53d4",
		format: "uuid",
	})
	@IsOptional()
	@IsUUID()
	public categoryId?: string;
}
