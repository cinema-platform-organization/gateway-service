import { ApiProperty } from "@nestjs/swagger";

import {
	SCREENING_TIME_FORMAT,
	ScreeningHallInfo,
	ScreeningMovieInfo,
	ScreeningSeatType,
	ScreeningTheaterInfo,
} from "./get-screenings-by-movie.response";

export class GetScreeningsResponse {
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
		description:
			"The movie being shown. **Not included** in GET /screenings/movie/{id} " +
			"(the movie is already known there).",
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
