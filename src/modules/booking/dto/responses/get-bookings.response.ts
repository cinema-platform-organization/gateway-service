import { ApiProperty } from "@nestjs/swagger";

export class BookingMovieInfo {
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
			"Path of the poster file in media storage (relative, not a full URL)",
		example: "posters/e0db4163fc2aab147599c750906396d3.jpg",
	})
	public poster: string;
}

export class BookingTheaterInfo {
	@ApiProperty({
		description: "Theater id",
		example: "81lI6j9Ctva6e7oCPpelc",
	})
	public id: string;

	@ApiProperty({ description: "Theater name", example: "Cinema City" })
	public name: string;
}

export class BookingHallInfo {
	@ApiProperty({ description: "Hall id", example: "tZwcb0sTC-0eiRZHm59r9" })
	public id: string;

	@ApiProperty({ description: "Hall name", example: "Hall 1" })
	public name: string;
}

export class BookingSeatInfo {
	@ApiProperty({ description: "Seat id", example: "kM2vRwYpQ8sN-4LzXbT7d" })
	public id: string;

	@ApiProperty({
		description:
			"Row number, starting at 1. 0 if the seat no longer exists in the hall.",
		example: 3,
	})
	public row: number;

	@ApiProperty({
		description:
			"Seat number within the row, starting at 1. 0 if the seat no longer exists in the hall.",
		example: 12,
	})
	public number: number;
}

export class GetBookingsResponse {
	@ApiProperty({
		description:
			"Booking (order) id. The same value is encoded in `qrCode`.",
		example: "X6KBMTnCDkbrPN_I0YXG8",
	})
	public id: string;

	@ApiProperty({
		description: "Screening date in Kyiv time (Europe/Kyiv), `YYYY-MM-DD`",
		example: "2026-12-21",
		format: "date",
	})
	public screeningDate: string;

	@ApiProperty({
		description:
			"Screening start time in Kyiv time (Europe/Kyiv, daylight saving " +
			"included), `HH:mm`, 24-hour. Display it as is, without converting.",
		example: "16:30",
		pattern: "^\\d{2}:\\d{2}$",
	})
	public screeningTime: string;

	@ApiProperty({
		type: BookingMovieInfo,
		description:
			"Movie of the screening. Omitted if the movie was deleted.",
	})
	public movie: BookingMovieInfo;

	@ApiProperty({
		type: BookingTheaterInfo,
		description:
			"Theater of the screening. Omitted if the theater was deleted.",
	})
	public theater: BookingTheaterInfo;

	@ApiProperty({
		type: BookingHallInfo,
		description: "Hall of the screening. Omitted if the hall was deleted.",
	})
	public hall: BookingHallInfo;

	@ApiProperty({
		type: [BookingSeatInfo],
		description: "All seats booked in this order",
	})
	public seats: BookingSeatInfo[];

	@ApiProperty({
		description:
			"QR code of the booking id as a PNG data URL, ready for `<img src>`. " +
			"Generated when the payment is confirmed.",
		example:
			"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHQAAAB0CAYAAABUmhYnAAAAAklEQVR4AewaftIAAAK...",
	})
	public qrCode: string;
}
