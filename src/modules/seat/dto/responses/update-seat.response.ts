import { ApiProperty } from "@nestjs/swagger";

import { GetSeatResponse } from "./get-seat.response";

export class UpdateSeatResponse {
	@ApiProperty({
		type: GetSeatResponse,
		description: "The seat after the update",
	})
	public seat: GetSeatResponse;
}
