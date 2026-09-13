import { ApiProperty } from "@nestjs/swagger";

export class ScreeningMovieInfo {
	@ApiProperty({ example: "026f20c4-4826-4bea-b5e0-72ce8dda53d4" })
	public id: string;

	@ApiProperty({ example: "Interstellar" })
	public title: string;

	@ApiProperty({ example: "interstellar" })
	public slug: string;

	@ApiProperty({ example: 169 })
	public duration: number;

	@ApiProperty({ example: "banners/e0db4163fc2aab147599c750906396d3.jpg" })
	public banner: string;

	@ApiProperty({ example: "posters/e0db4163fc2aab147599c750906396d3.jpg" })
	public poster: string;
}

export class ScreeningTheaterInfo {
	@ApiProperty({ example: "81lI6j9Ctva6e7oCPpelc" })
	public id: string;

	@ApiProperty({ example: "Cinema City" })
	public name: string;

	@ApiProperty({ example: "123 Main St, Kyiv" })
	public address: string;
}

export class ScreeningHallInfo {
	@ApiProperty({ example: "tZwcb0sTC-0eiRZHm59r9" })
	public id: string;

	@ApiProperty({ example: "Hall 1" })
	public name: string;
}

export class ScreeningSeatType {
	@ApiProperty({ example: "vip" })
	public type: string;

	@ApiProperty({ example: 250 })
	public price: number;
}

export class GetScreeningsByMovieResponse {
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
