import { ApiProperty } from "@nestjs/swagger";

export class BookingMovieInfo {
	@ApiProperty({ example: "026f20c4-4826-4bea-b5e0-72ce8dda53d4" })
	public id: string;

	@ApiProperty({ example: "Interstellar" })
	public title: string;

	@ApiProperty({ example: "posters/e0db4163fc2aab147599c750906396d3.jpg" })
	public poster: string;
}

export class BookingTheaterInfo {
	@ApiProperty({ example: "81lI6j9Ctva6e7oCPpelc" })
	public id: string;

	@ApiProperty({ example: "Cinema City" })
	public name: string;
}

export class BookingHallInfo {
	@ApiProperty({ example: "tZwcb0sTC-0eiRZHm59r9" })
	public id: string;

	@ApiProperty({ example: "Hall 1" })
	public name: string;
}

export class BookingSeatInfo {
	@ApiProperty({ example: "kM2vRwYpQ8sN-4LzXbT7d" })
	public id: string;

	@ApiProperty({ example: 3 })
	public row: number;

	@ApiProperty({ example: 12 })
	public number: number;
}

export class GetBookingsResponse {
	@ApiProperty({ example: "X6KBMTnCDkbrPN_I0YXG8" })
	public id: string;

	@ApiProperty({ example: "2026-12-21" })
	public screeningDate: string;

	@ApiProperty({ example: "16:30" })
	public screeningTime: string;

	@ApiProperty({ type: BookingMovieInfo })
	public movie: BookingMovieInfo;

	@ApiProperty({ type: BookingTheaterInfo })
	public theater: BookingTheaterInfo;

	@ApiProperty({ type: BookingHallInfo })
	public hall: BookingHallInfo;

	@ApiProperty({ type: [BookingSeatInfo] })
	public seats: BookingSeatInfo[];

	@ApiProperty({
		example: "aHR0cHM6Ly9jaW5lbWEtcGxhdGZvcm0uY29tL29yZGVyLzEyMw==",
	})
	public qrCode: string;
}
