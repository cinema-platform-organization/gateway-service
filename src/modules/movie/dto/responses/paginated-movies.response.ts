import { ApiProperty } from "@nestjs/swagger";

import { GetMoviesResponse } from "./get-movies.response";

export class PaginatedMoviesResponse {
	@ApiProperty({
		type: [GetMoviesResponse],
		description:
			"Movies on this page. Empty when nothing matches or the page is past the end.",
	})
	public data: GetMoviesResponse[];

	@ApiProperty({
		description: "Current page, as requested. Always 1 when `random=true`.",
		example: 1,
	})
	public page: number;

	@ApiProperty({ description: "Page size, as requested", example: 20 })
	public limit: number;

	@ApiProperty({
		description: "Total number of movies matching the filter",
		example: 137,
	})
	public total: number;

	@ApiProperty({
		description:
			"Number of pages: `ceil(total / limit)`. Always 1 when `random=true`, " +
			"0 when nothing matches (without `random`).",
		example: 7,
	})
	public totalPages: number;
}
