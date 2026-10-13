import { ApiProperty } from "@nestjs/swagger";

import { GetScreeningsResponse } from "./get-screenings.response";

export class PaginatedScreeningsResponse {
	@ApiProperty({
		type: [GetScreeningsResponse],
		description:
			"Screenings, earliest first. Screenings whose hall, theater or movie can't " +
			"be loaded are skipped, so this can be shorter than `limit`.",
	})
	public data: GetScreeningsResponse[];

	@ApiProperty({
		description:
			"Current page, as requested (meaningless when `date` is set)",
		example: 1,
	})
	public page: number;

	@ApiProperty({
		description: "Page size, as requested (meaningless when `date` is set)",
		example: 20,
	})
	public limit: number;

	@ApiProperty({
		description: "Total number of matching screenings",
		example: 84,
	})
	public total: number;

	@ApiProperty({
		description:
			"Number of pages: `ceil(total / limit)`. 0 when nothing matches.",
		example: 5,
	})
	public totalPages: number;
}
