import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class GetMovieResponse {
	@ApiProperty({ example: "026f20c4-4826-4bea-b5e0-72ce8dda53d4" })
	public id: string;

	@ApiProperty({ example: "Interstellar" })
	public title: string;

	@ApiPropertyOptional({ example: "interstellar" })
	public slug?: string;

	@ApiProperty({
		example: "A team of explorers travel through a wormhole in space.",
	})
	public description: string;

	@ApiProperty({ example: "posters/e0db4163fc2aab147599c750906396d3.jpg" })
	public poster: string;

	@ApiPropertyOptional({
		example: "banners/e0db4163fc2aab147599c750906396d3.jpg",
	})
	public banner?: string;

	@ApiProperty({ example: 169 })
	public duration: number;

	@ApiPropertyOptional({ example: 12 })
	public ratingAge?: number;

	@ApiPropertyOptional({ example: "USA" })
	public country?: string;

	@ApiPropertyOptional({ example: "2014-11-07T00:00:00.000Z" })
	public releaseDate?: string;
}
