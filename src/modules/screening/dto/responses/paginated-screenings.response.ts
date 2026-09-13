import { ApiProperty } from "@nestjs/swagger";

import { GetScreeningsResponse } from "./get-screenings.response";

export class PaginatedScreeningsResponse {
	@ApiProperty({ type: [GetScreeningsResponse] })
	public data: GetScreeningsResponse[];

	@ApiProperty({ example: 1 })
	public page: number;

	@ApiProperty({ example: 20 })
	public limit: number;

	@ApiProperty({ example: 84 })
	public total: number;

	@ApiProperty({ example: 5 })
	public totalPages: number;
}
