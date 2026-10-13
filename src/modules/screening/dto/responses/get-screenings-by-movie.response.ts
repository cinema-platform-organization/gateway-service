import { ApiProperty } from "@nestjs/swagger";

const SCREENING_TIME_FORMAT =
	"Format `YYYY-MM-DD HH:mm:ss.SSS` in **UTC**, without the `Z` suffix " +
	'(append `Z` before parsing, e.g. `new Date(value.replace(" ", "T") + "Z")`).';

export class ScreeningMovieInfo {
	@ApiProperty({
		description: "Movie id",
		example: "026f20c4-4826-4bea-b5e0-72ce8dda53d4",
		format: "uuid",
	})
	public id: string;

	@ApiProperty({ description: "Movie title", example: "Interstellar" })
	public title: string;

	@ApiProperty({
		description:
			"Movie slug for GET /movies/{slug}. Missing if the movie has none.",
		example: "interstellar",
	})
	public slug: string;

	@ApiProperty({ description: "Running time in minutes", example: 169 })
	public duration: number;

	@ApiProperty({
		description:
			"Path of the banner file in media storage (relative). Missing if the movie has none.",
		example: "banners/e0db4163fc2aab147599c750906396d3.jpg",
	})
	public banner: string;

	@ApiProperty({
		description: "Path of the poster file in media storage (relative)",
		example: "posters/e0db4163fc2aab147599c750906396d3.jpg",
	})
	public poster: string;
}

export class ScreeningTheaterInfo {
	@ApiProperty({
		description: "Theater id",
		example: "81lI6j9Ctva6e7oCPpelc",
	})
	public id: string;

	@ApiProperty({ description: "Theater name", example: "Cinema City" })
	public name: string;

	@ApiProperty({
		description: "Street address",
		example: "123 Main St, Kyiv",
	})
	public address: string;
}

export class ScreeningHallInfo {
	@ApiProperty({ description: "Hall id", example: "tZwcb0sTC-0eiRZHm59r9" })
	public id: string;

	@ApiProperty({ description: "Hall name", example: "Hall 1" })
	public name: string;
}

export class ScreeningSeatType {
	@ApiProperty({
		description: "Seat type: `standard`, `vip` or `premium`",
		example: "vip",
	})
	public type: string;

	@ApiProperty({
		description: "Ticket price for this seat type in UAH",
		example: 250,
	})
	public price: number;
}

export class GetScreeningsByMovieResponse {
	@ApiProperty({
		description: "Screening id",
		example: "YszAkVVKt6Y4RTjfpmnrT",
	})
	public id: string;

	@ApiProperty({
		description: `Start time. ${SCREENING_TIME_FORMAT}`,
		example: "2026-12-21 14:30:00.000",
	})
	public startAt: string;

	@ApiProperty({
		description: `End time. ${SCREENING_TIME_FORMAT}`,
		example: "2026-12-21 17:30:00.000",
	})
	public endAt: string;

	@ApiProperty({
		type: ScreeningTheaterInfo,
		description: "Theater of the hall",
	})
	public theater: ScreeningTheaterInfo;

	@ApiProperty({
		type: ScreeningHallInfo,
		description: "Hall of the screening",
	})
	public hall: ScreeningHallInfo;

	@ApiProperty({
		type: ScreeningMovieInfo,
		description: "The movie being shown",
	})
	public movie: ScreeningMovieInfo;

	@ApiProperty({
		type: [ScreeningSeatType],
		description:
			"Distinct seat type + price combinations in the hall, for showing prices. " +
			"Missing if the hall has no seats.",
	})
	public seatTypes: ScreeningSeatType[];
}

export { SCREENING_TIME_FORMAT };
