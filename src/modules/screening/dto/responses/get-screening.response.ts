import { ApiProperty } from "@nestjs/swagger";

import {
	ScreeningHallInfo,
	ScreeningMovieInfo,
	ScreeningSeatType,
	ScreeningTheaterInfo,
} from "./get-screenings-by-movie.response";

export class GetScreeningResponse {
	@ApiProperty({ example: "YszAkVVKt6Y4RTjfpmnrT" })
	public id: string;

	@ApiProperty({
		example:
			"Thu Sep 10 2026 10:00:00 GMT+0000 (Coordinated Universal Time)",
	})
	public startAt: string;

	@ApiProperty({
		example:
			"Thu Sep 10 2026 12:10:00 GMT+0000 (Coordinated Universal Time)",
	})
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
