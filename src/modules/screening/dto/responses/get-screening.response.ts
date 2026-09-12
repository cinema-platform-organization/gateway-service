import { ApiProperty } from "@nestjs/swagger";

export class GetScreeningResponse {
	@ApiProperty({ example: "X6KBMTnCDkbrPN_I0YXG8" })
	public id: string;

	@ApiProperty({ example: "tZwcb0sTC-0eiRZHm59r9" })
	public hallId: string;

	@ApiProperty({ example: "026f20c4-4826-4bea-b5e0-72ce8dda53d4" })
	public movieId: string;

	@ApiProperty({ example: "2026-12-21 16:30:00.000" })
	public startAt: string;

	@ApiProperty({ example: "2026-12-21 19:30:00.000" })
	public endAt: string;
}
