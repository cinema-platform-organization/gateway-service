import { ApiProperty } from "@nestjs/swagger";

import { GetBookingsResponse } from "./get-bookings.response";

export class PaginatedBookingsResponse {
	@ApiProperty({ type: [GetBookingsResponse] })
	public data: GetBookingsResponse[];

	@ApiProperty({ example: 1 })
	public page: number;

	@ApiProperty({ example: 20 })
	public limit: number;

	@ApiProperty({ example: 42 })
	public total: number;

	@ApiProperty({ example: 3 })
	public totalPages: number;
}
