import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class GetMovieResponse {
	@ApiProperty({
		description: "Movie id",
		example: "026f20c4-4826-4bea-b5e0-72ce8dda53d4",
		format: "uuid",
	})
	public id: string;

	@ApiProperty({ description: "Movie title", example: "Interstellar" })
	public title: string;

	@ApiPropertyOptional({
		description: "URL-friendly identifier. Missing if the movie has none.",
		example: "interstellar",
	})
	public slug?: string;

	@ApiProperty({
		description: "Plot description",
		example: "A team of explorers travel through a wormhole in space.",
	})
	public description: string;

	@ApiProperty({
		description:
			"Path of the poster file in media storage (relative, not a full URL)",
		example: "posters/e0db4163fc2aab147599c750906396d3.jpg",
	})
	public poster: string;

	@ApiPropertyOptional({
		description:
			"Path of the banner file in media storage (relative). Missing if the movie has none.",
		example: "banners/e0db4163fc2aab147599c750906396d3.jpg",
	})
	public banner?: string;

	@ApiProperty({ description: "Running time in minutes", example: 169 })
	public duration: number;

	@ApiPropertyOptional({
		description:
			"Minimum viewer age, 0–21. Missing when it is 0 (no restriction).",
		example: 12,
	})
	public ratingAge?: number;

	@ApiPropertyOptional({
		description: "Country of production. Missing if not set.",
		example: "USA",
	})
	public country?: string;

	@ApiPropertyOptional({
		description:
			"Release date as an ISO 8601 UTC timestamp. Always present in the response: " +
			"`null` when the movie has no release date.",
		example: "2014-11-07T00:00:00.000Z",
		format: "date-time",
	})
	public releaseDate?: string;

	@ApiPropertyOptional({
		description: "Release year. Missing if not set.",
		example: 2014,
	})
	public releaseYear?: number;

	@ApiPropertyOptional({
		description: "Category id. Missing if the movie has no category.",
		example: "026f20c4-4826-4bea-b5e0-72ce8dda53d4",
		format: "uuid",
	})
	public categoryId?: string;
}
