import { ApiProperty } from "@nestjs/swagger";

import {
	ScreeningHallInfo,
	ScreeningMovieInfo,
	ScreeningSeatType,
	ScreeningTheaterInfo,
} from "./get-screenings-by-movie.response";

export class GetScreeningsResponse {
	@ApiProperty({ example: "X6KBMTnCDkbrPN_I0YXG8" })
	public id: string;

	@ApiProperty({ example: "2026-12-21 16:30:00.000" })
	public startAt: string;

	@ApiProperty({ example: "2026-12-21 19:30:00.000" })
	public endAt: string;

	@ApiProperty({ type: ScreeningTheaterInfo })
	public theater: ScreeningTheaterInfo;

	@ApiProperty({ type: ScreeningHallInfo })
	public hall: ScreeningHallInfo;

	@ApiProperty({ type: ScreeningMovieInfo })
	public movie: ScreeningMovieInfo;

	@ApiProperty({ type: [ScreeningSeatType] })
	public seatTypes: ScreeningSeatType[];
}
