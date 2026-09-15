import { ApiProperty } from "@nestjs/swagger";

import { SeatType } from "./get-seats-by-hall.response";

export class GetSeatResponse {
	@ApiProperty({ example: "kM2vRwYpQ8sN-4LzXbT7d" })
	public id: string;

	@ApiProperty({ example: 3 })
	public row: number;

	@ApiProperty({ example: 12 })
	public number: number;

	@ApiProperty({ example: 250 })
	public price: number;

	@ApiProperty({ example: SeatType.VIP, enum: SeatType })
	public type: SeatType;

	@ApiProperty({ example: "tZwcb0sTC-0eiRZHm59r9" })
	public hallId: string;
}
