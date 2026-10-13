import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, TransformFnParams } from "class-transformer";
import {
	IsDateString,
	IsInt,
	IsNotEmpty,
	IsOptional,
	IsString,
	IsUUID,
	Max,
	MaxLength,
	Min,
} from "class-validator";

export class CreateMovieRequest {
	@ApiProperty({
		description: "Movie title",
		example: "Interstellar",
		maxLength: 255,
	})
	@IsString()
	@IsNotEmpty()
	@MaxLength(255)
	public title: string;

	@ApiPropertyOptional({
		description:
			"URL-friendly identifier used in GET /movies/{slug}. Must be unique. " +
			"Not generated automatically: without it the movie can't be opened by slug.",
		example: "interstellar",
		maxLength: 255,
	})
	@IsOptional()
	@IsString()
	@MaxLength(255)
	public slug?: string;

	@ApiProperty({
		description: "Plot description",
		example: "A team of explorers travel through a wormhole in space.",
	})
	@IsString()
	@IsNotEmpty()
	public description: string;

	@ApiProperty({
		description: "Running time in minutes (whole number, at least 1)",
		example: 169,
		minimum: 1,
	})
	@IsInt()
	@Min(1)
	@Transform(({ value }: TransformFnParams) => {
		const raw = value as unknown;

		return Number(raw);
	})
	public duration: number;

	@ApiPropertyOptional({
		description: "Release year (whole number)",
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
			"Release date, ISO 8601. A date without time (`2014-11-07`) is stored as " +
			"midnight UTC. Decides whether the movie is listed under `now` or `soon` " +
			"in GET /movies.",
		example: "2014-11-07",
		format: "date",
	})
	@IsOptional()
	@IsDateString()
	public releaseDate?: string;

	@ApiPropertyOptional({
		description: "Minimum viewer age, 0–21 (0 = no restriction)",
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
		description: "Country of production",
		example: "USA",
		maxLength: 255,
	})
	@IsOptional()
	@IsString()
	@MaxLength(255)
	public country?: string;

	@ApiPropertyOptional({
		description: "Id of an existing category",
		example: "026f20c4-4826-4bea-b5e0-72ce8dda53d4",
		format: "uuid",
	})
	@IsOptional()
	@IsUUID()
	public categoryId?: string;
}
