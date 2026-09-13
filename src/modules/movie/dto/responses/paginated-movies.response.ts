import { ApiProperty } from "@nestjs/swagger";

import { GetMoviesResponse } from "./get-movies.response";

export class PaginatedMoviesResponse {
	@ApiProperty({ type: [GetMoviesResponse] })
	public data: GetMoviesResponse[];

	@ApiProperty({ example: 1 })
	public page: number;

	@ApiProperty({ example: 20 })
	public limit: number;

	@ApiProperty({ example: 137 })
	public total: number;

	@ApiProperty({ example: 7 })
	public totalPages: number;
}
