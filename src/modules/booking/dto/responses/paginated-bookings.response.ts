import { ApiProperty } from "@nestjs/swagger";

import { GetBookingsResponse } from "./get-bookings.response";

export class PaginatedBookingsResponse {
	@ApiProperty({
		type: [GetBookingsResponse],
		description:
			"Bookings on this page. Empty when the user has none or the page is past the end.",
	})
	public data: GetBookingsResponse[];

	@ApiProperty({ description: "Current page, as requested", example: 1 })
	public page: number;

	@ApiProperty({ description: "Page size, as requested", example: 20 })
	public limit: number;

	@ApiProperty({
		description:
			"Total number of the user's paid bookings across all pages",
		example: 42,
	})
	public total: number;

	@ApiProperty({
		description:
			"Number of pages: `ceil(total / limit)`. 0 when there are no bookings.",
		example: 3,
	})
	public totalPages: number;
}
