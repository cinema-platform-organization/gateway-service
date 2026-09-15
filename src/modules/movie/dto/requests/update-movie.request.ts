import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
	IsDateString,
	IsInt,
	IsOptional,
	IsString,
	Max,
	Min,
} from "class-validator";

export class UpdateMovieRequest {
	@ApiPropertyOptional({ example: "Interstellar" })
	@IsOptional()
	@IsString()
	public title?: string;

	@ApiPropertyOptional({ example: "interstellar" })
	@IsOptional()
	@IsString()
	public slug?: string;

	@ApiPropertyOptional({
		example: "A team of explorers travel through a wormhole in space.",
	})
	@IsOptional()
	@IsString()
	public description?: string;

	@ApiPropertyOptional({ example: 169 })
	@IsOptional()
	@IsInt()
	@Min(1)
	@Transform(({ value }) => Number(value))
	public duration?: number;

	@ApiPropertyOptional({ example: 2014 })
	@IsOptional()
	@IsInt()
	@Transform(({ value }) => Number(value))
	public releaseYear?: number;

	@ApiPropertyOptional({ example: "2014-11-07" })
	@IsOptional()
	@IsDateString()
	public releaseDate?: string;

	@ApiPropertyOptional({ example: 12 })
	@IsOptional()
	@IsInt()
	@Min(0)
	@Max(21)
	@Transform(({ value }) => Number(value))
	public ratingAge?: number;

	@ApiPropertyOptional({ example: "USA" })
	@IsOptional()
	@IsString()
	public country?: string;

	@ApiPropertyOptional({ example: "026f20c4-4826-4bea-b5e0-72ce8dda53d4" })
	@IsOptional()
	@IsString()
	public categoryId?: string;
}
