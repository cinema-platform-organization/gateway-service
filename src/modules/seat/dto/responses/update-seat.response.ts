import { ApiProperty } from "@nestjs/swagger";

import { GetSeatResponse } from "./get-seat.response";

export class UpdateSeatResponse {
	@ApiProperty({ type: GetSeatResponse })
	public seat: GetSeatResponse;
}
